import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { CheckCircle, GripVertical, Phone, Plus, Tag, Upload, X } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import AdminButton from "../../components/admin/AdminButton";
import ListCard from "../../components/admin/ListCard";
import { useDb } from "../../context/admin/DbContext";
import { useToast } from "../../context/admin/ToastContext";
import { type Contact } from "../../types/database";
import { adminApiRequest } from "../../utils/api";

// --- Excel oszlopdetektálás ---

const normalizeHeader = (s: string) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const NAME_KEYWORDS = ["nev", "name", "szemely", "kontakt", "person"];
const PHONE_KEYWORDS = [
  "tel",
  "phone",
  "telefon",
  "telefonszam",
  "telefon szam",
  "mobil",
  "szam",
  "number",
  "mob",
];

const findCol = (headers: string[], keywords: string[]) =>
  headers.find((h) => keywords.some((k) => normalizeHeader(h).includes(k))) ?? null;

interface ImportPreview {
  rows: { name: string; tel?: string }[];
  nameCol: string;
  phoneCol: string | null;
}

// ---

const ContactListPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // DB
  const context = useDb();
  const [data, setData] = useState<Contact[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await context.getContacts();
        setData(data);
      } catch (err) {
        console.error("Hiba az adatok lekérésekor:", err);
      } finally {
        setLocalLoading(false);
      }
    };

    fetchLatest();
  }, [context]);

  // Drag & Drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(data);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setData(items);

    try {
      const orderedIds = items.map((item) => item.id);
      await adminApiRequest("/contact/reorder", {
        method: "POST",
        body: JSON.stringify(orderedIds),
      });
      context.reorderContactsInCache(orderedIds);
      showToast("Sorrend sikeresen mentve.");
    } catch {
      showToast("Hiba történt a sorrend mentésekor.", "error");
      const originalData = await context.getContacts();
      setData(originalData);
    }
  };

  // --- Excel import ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const workbook = XLSX.read(ev.target?.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });

        if (rawRows.length === 0) {
          showToast("Az Excel fájl üres.", "error");
          return;
        }

        const headers = Object.keys(rawRows[0]);
        const nameCol = findCol(headers, NAME_KEYWORDS);
        const phoneCol = findCol(headers, PHONE_KEYWORDS);

        if (!nameCol) {
          showToast("Nem található névoszlop. Ellenőrizd az oszlopneveket.", "error");
          return;
        }

        const rows = rawRows
          .map((r) => ({
            name: String(r[nameCol] ?? "").trim(),
            tel: phoneCol ? String(r[phoneCol] ?? "").trim() || undefined : undefined,
          }))
          .filter((r) => r.name.length > 0);

        if (rows.length === 0) {
          showToast("Nem találhatók importálható sorok.", "error");
          return;
        }

        setPreview({ rows, nameCol, phoneCol });
      } catch {
        showToast("Nem sikerült beolvasni a fájlt.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      await adminApiRequest("/contact/bulk", {
        method: "POST",
        body: JSON.stringify(preview.rows),
      });
      const fresh: Contact[] = await adminApiRequest("/contact");
      setData(fresh);
      context.flushCache();
      showToast(`${preview.rows.length} elérhetőség sikeresen importálva.`);
      setPreview(null);
    } catch {
      showToast("Hiba történt az importálás során.", "error");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Szekció */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Elérhetőségek
          </h1>
          <p className="text-gray-500 mt-1">
            Szerkeszd az alkalmazásban megjelenő elérhetőségeket.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <AdminButton
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload size={18} />}
            className="w-full md:w-auto px-5 py-3 border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Importálás Excel-ből
          </AdminButton>
          <AdminButton
            to="/admin/contact/new"
            icon={<Plus size={20} />}
            className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
          >
            Új elérhetőség létrehozása
          </AdminButton>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Import előnézet */}
      {preview && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-indigo-900">
                {preview.rows.length} importálandó elérhetőség
              </p>
              <p className="text-sm text-indigo-600 mt-0.5">
                Névoszlop: <strong>{preview.nameCol}</strong>
                {preview.phoneCol && (
                  <>
                    {" "}
                    &nbsp;·&nbsp; Telefonoszlop: <strong>{preview.phoneCol}</strong>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() => setPreview(null)}
              className="text-indigo-400 hover:text-indigo-700 shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          <div className="divide-y divide-indigo-100 max-h-48 overflow-y-auto rounded-xl bg-white border border-indigo-100">
            {preview.rows.slice(0, 10).map((row, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700"
              >
                <span className="flex-1 font-medium">{row.name}</span>
                {row.tel && <span className="text-gray-400">{row.tel}</span>}
              </div>
            ))}
            {preview.rows.length > 10 && (
              <div className="px-4 py-2 text-sm text-indigo-400 italic">
                ...és még {preview.rows.length - 10} további
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <AdminButton
              onClick={handleImport}
              icon={<CheckCircle size={18} />}
              className="px-5 py-2.5 shadow-indigo-200 shadow-md"
              disabled={importing}
            >
              {importing ? "Importálás..." : "Importálás megerősítése"}
            </AdminButton>
            <AdminButton
              onClick={() => setPreview(null)}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Mégse
            </AdminButton>
          </div>
        </div>
      )}

      {/* Lista konténer */}
      <div className="grid gap-4">
        {localLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">
            Adatok betöltése...
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Még nincsenek létrehozott elérhetőségek.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="contacts-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid gap-4"
                >
                  {data.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? "shadow-2xl ring-2 ring-indigo-500 rounded-2xl" : ""}`}
                        >
                          <ListCard
                            key={item.id}
                            id={item.id.toString()}
                            icon={<GripVertical size={24} />}
                            title={item.name}
                            info={
                              <span className="flex items-center gap-2">
                                {item.role && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                                    <Tag size={10} /> {item.role.name}
                                  </span>
                                )}
                                {item.tel && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                                    <Phone size={10} /> {item.tel}
                                  </span>
                                )}
                              </span>
                            }
                            editAction={() => navigate(`/admin/contact/${item.id}`)}
                            deleteAction={async () => {
                              try {
                                const resp = await adminApiRequest(
                                  `/contact/${item.id}`,
                                  {
                                    method: "DELETE",
                                  }
                                );
                                context.removeContactFromCache(resp.id);
                                showToast("Sikeresen törölve.");
                              } catch {
                                showToast("Sikertelen törlés.", "error");
                              }
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default ContactListPage;
