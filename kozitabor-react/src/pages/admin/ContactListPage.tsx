import { useEffect, useState } from 'react';
import { Plus, Phone, GripVertical } from 'lucide-react';
import AdminButton from '../../components/admin/AdminButton';
import { type Contact } from '../../types/database';
import { useDb } from '../../context/admin/DbContext';
import ListCard from '../../components/admin/ListCard';
import { useNavigate } from 'react-router-dom';
import { adminApiRequest } from '../../utils/api';
import { useToast } from '../../context/admin/ToastContext';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

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

        // Új sorrend kiszámítása lokálisan
        const items = Array.from(data);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // UI frissítése azonnal (optimista)
        setData(items);

        try {
            // ID-k listájának kinyerése az új sorrendben
            const orderedIds = items.map(item => item.id);
            
            // Backend hívás
            await adminApiRequest('/contact/reorder', {
                method: 'POST',
                body: JSON.stringify(orderedIds)
            });

            // Reorder global context cache
            context.reorderContactsInCache(orderedIds);
            
            showToast("Sorrend sikeresen mentve.");
        } catch (err) {
            showToast("Hiba történt a sorrend mentésekor.", 'error');
            const originalData = await context.getContacts();
            setData(originalData);
        }
    };

  return (
    <div className="space-y-6">
      {/* Header Szekció */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kontaktok</h1>
          <p className="text-gray-500 mt-1">Szerkeszd az alkalmazásban megjelenő kontaktokat.</p>
        </div>
        <AdminButton 
          to="/admin/contact/new" 
          icon={<Plus size={20} />} 
          className="w-full md:w-auto px-6 py-3 shadow-indigo-200 shadow-lg"
        >
          Új kontakt létrehozása
        </AdminButton>
      </div>

      {/* Lista konténer (Grid helyett Stack) */}
      <div className="grid gap-4">
        {localLoading ? (
          <div className="py-20 text-center text-gray-400 animate-pulse">Adatok betöltése...</div>
        ) : data.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Még nincsenek létrehozott kontaktok.</p>
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
                    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
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
                              icon={
                                <GripVertical size={24} />
                              }
                              title={item.name}
                              info={ item.tel ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">
                                      <Phone size={10} /> {item.tel}
                                  </span>)
                                  : ""
                              }
                              editAction={() => navigate(`/admin/contact/${item.id}`)}
                              deleteAction={async () => {
                                  try {
                                      const resp = await adminApiRequest(`/contact/${item.id}`, {
                                          method: 'DELETE'
                                      });

                                      context.removeContactFromCache(resp.id);
                                      showToast("Sikeresen törölve.");
                                  } catch (err) {
                                      showToast("Sikertelen törlés.", 'error');
                                  }
                              }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {/* Droppable placeholder */}
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