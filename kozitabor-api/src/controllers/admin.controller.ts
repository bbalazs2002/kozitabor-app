import 'dotenv/config';
import { type Request, type Response } from 'express';
import { parseId } from '../utils/parser.js';
import { prisma } from '../lib/prisma.js';

// Helper functions
const normalizeToUtcNoon = (dateInput: string | Date): Date => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    12, 0, 0, 0
  ));
};

// --- INFO & MAP ---
export const getInfos = async (_req: Request, res: Response) => {
  try {
    const nodes = await prisma.info.findMany({
      include: { map: true },
      orderBy: { id: 'desc' }
    });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: "Hiba a lekérés során" });
  }
};
export const getInfo = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }
    
    try {
        const node = await prisma.info.findUnique({
            where: {
                id: id
            },
            include: { map: true }
        });
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: "Hiba a lekérés során", code: error });
    }
};
export const createInfo = async (req: Request, res: Response) => {
  try {
    const { title, icon, content, map } = req.body;

    const newNode = await prisma.info.create({
      data: {
        title,
        icon,
        content,
        // Ha a show true, létrehozzuk a kapcsolódó Map rekordot is
        map: map?.show ? {
          create: {
            lat: Number(map.lat),
            lng: Number(map.lng),
            zoom: Number(map.zoom),
            title: title // Opcionális: a térkép neve legyen az infó címe
          }
        } : undefined
      },
      include: { map: true } // Visszaküldjük a létrehozott térképet is
    });

    res.status(201).json(newNode);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(400).json({ error: "Nem sikerült létrehozni az információt" });
  }
};
export const updateInfo = async (req: Request, res: Response) => {

    let id:number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }
    const { title, icon, content, map } = req.body;

    try {
        // 1. Megkeressük a meglévő rekordot, hogy tudjuk, van-e már hozzá térkép
        const existingNode = await prisma.info.findUnique({
            where: { id: id },
            include: { map: true }
        });

        if (!existingNode) {
            return res.status(404).json({ error: "Az információ nem található." });
        }

        // 2. Frissítés végrehajtása
        const updatedNode = await prisma.info.update({
            where: { id: id },
            data: {
                title,
                icon,
                content,
                // Relációs logika:
                map: map?.show 
                    ? {
                        // Ha van 'show: true', akkor upsert (ha van frissít, ha nincs készít)
                        upsert: {
                            create: {
                                lat: map.lat,
                                lng: map.lng,
                                zoom: map.zoom,
                                title: title // A térkép neve megegyezhet az infó címével
                            },
                            update: {
                                lat: map.lat,
                                lng: map.lng,
                                zoom: map.zoom
                            }
                        }
                    }
                    : {
                        // Ha 'show: false', akkor töröljük a kapcsolódó térképet, ha létezett
                        delete: existingNode.map ? true : false
                    }
            },
            include: { map: true }
        });

        return res.json(updatedNode);

    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Sikertelen mentés az adatbázisba." });
    }
};
export const removeInfo = async (req: Request, res: Response) => {
    let id:number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    try {
        // Először ellenőrizzük, létezik-e
        const existing = await prisma.info.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Az információ már nem létezik" });
        }

        // Törlés (ha a sémában 'onDelete: Cascade' van, a térkép is törlődik)
        await prisma.info.delete({
            where: { id }
        });

        res.json({ message: "Sikeres törlés", id });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Hiba történt a törlés során" });
    }
};

// --- Contact ---
export const getContacts = async (_req: Request, res: Response) => {
  try {
    const nodes = await prisma.contact.findMany({
      orderBy: { ordering: 'asc' }
    });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: "Hiba a lekérés során" });
  }
};
export const getContact = async (req: Request, res: Response) => {
    let id:number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }
    
    try {
        const node = await prisma.contact.findUnique({
            where: {
                id: id
            }
        });
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: "Hiba a lekérés során", code: error });
    }
};
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, tel } = req.body;

    const newNode = await prisma.contact.create({
      data: {
        name,
        tel
      }
    });

    res.status(201).json(newNode);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(400).json({ error: "Nem sikerült létrehozni a kontaktot" });
  }
};
export const updateContact = async (req: Request, res: Response) => {

    let id:number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }
    const { name, tel } = req.body;

    try {
        // Frissítés végrehajtása
        const updatedNode = await prisma.contact.update({
            where: { id: id },
            data: {
                name,
                tel
            }
        });

        return res.json(updatedNode);

    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Sikertelen mentés az adatbázisba." });
    }
};
export const reorderContacts = async (req: Request, res: Response) => {
  try {
    const orderedIds: number[] = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "Érvénytelen formátum. ID listát várunk." });
    }

    // Prisma Transaction használata a biztonság érdekében
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.contact.update({
          where: { id: Number(id) },
          data: { ordering: index + 1 },
        })
      )
    );

    res.json({ success: true, message: "Sorrend sikeresen frissítve." });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ error: "Nem sikerült menteni az új sorrendet." });
  }
};
export const removeContact = async (req: Request, res: Response) => {
    let id:number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    try {
        // Először ellenőrizzük, létezik-e
        const existing = await prisma.contact.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "A kontakt már nem létezik" });
        }

        await prisma.contact.delete({
            where: { id }
        });

        res.json({ message: "Sikeres törlés", id });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Hiba történt a törlés során" });
    }
};

// --- Teams ---
export const getTeams = async (_req: Request, res: Response) => {
  try {
    const nodes = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: "Hiba a lekérés során" });
  }
};
export const getTeam = async (req: Request, res: Response) => {
    let id:number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }
    
    try {
        const node = await prisma.team.findUnique({
            where: { id: id },
            include: {
                leaders: {
                    include: {
                        contact: true
                    },
                    orderBy: {
                        contact: {
                            name: "asc"
                        }
                    }
                }
            }
        });
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: "Hiba a lekérés során", code: error });
    }
};
export const createTeam = async (req: Request, res: Response) => {
  try {
    // A frontendről érkező adatokat destruktúráljuk
    const { name, leaderIds } = req.body;

    const newNode = await prisma.team.create({
        data: {
            name,
            leaders: {
            create: (leaderIds || []).map((cId: number) => ({
                contact: {
                connect: { id: Number(cId) }
                }
            }))
            }
        },
        include: {
            leaders: {
                include: {
                    contact: true,
                },
                orderBy: {
                    contact: {
                        name: "asc"
                    }
                }
            }
        }
    });

    res.status(201).json(newNode);
  } catch (error) {
    console.error("Create Team Error:", error);
    res.status(400).json({ error: "Nem sikerült létrehozni a csapatot." });
  }
};
export const updateTeam = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    // A body-ból a nevet és a kijelölt kontaktok ID-it várjuk
    const { name, leaderIds } = req.body;

    try {
        const updatedNode = await prisma.team.update({
            where: { id: id },
            data: {
                name,
                leaders: {
                    // 1. Minden korábbi Leader rekord törlése ehhez a csapathoz
                    deleteMany: {},
                    // 2. Az új ID-k alapján az új rekordok létrehozása
                    create: (leaderIds || []).map((cId: number) => ({
                        contact: {
                            connect: { id: Number(cId) }
                        }
                    }))
                }
            },
            // Visszaadjuk a frissített adatokat a nevekkel együtt a UI-nak
            include: {
                leaders: {
                    include: {
                        contact: true,
                    },
                    orderBy: {
                        contact: {
                            name: "asc"
                        }
                    }
                }
            }
        });

        return res.json(updatedNode);

    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Sikertelen mentés az adatbázisba." });
    }
};
export const removeTeam = async (req: Request, res: Response) => {
    let id:number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    try {
        // Először ellenőrizzük, létezik-e
        const existing = await prisma.team.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "A csapat már nem létezik" });
        }

        await prisma.team.delete({
            where: { id }
        });

        res.json({ message: "Sikeres törlés", id });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Hiba történt a törlés során" });
    }
};

// --- Activities ---
export const getActivities = async (_req: Request, res: Response) => {
    try {
        const nodes = await prisma.activity.findMany({
        orderBy: { title: 'asc' }
        });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: "Hiba a tevékenységek lekérése során" });
    }
};
export const getActivity = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }
    
    try {
        const node = await prisma.activity.findUnique({
            where: { id: id }
        });
        
        if (!node) return res.status(404).json({ error: "Tevékenység nem található" });
        
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: "Hiba a lekérés során" });
    }
};
export const createActivity = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    const newNode = await prisma.activity.create({
        data: { title }
    });

    res.status(201).json(newNode);
  } catch (error) {
    console.error("Create Activity Error:", error);
    res.status(400).json({ error: "Nem sikerült létrehozni a tevékenységet." });
  }
};
export const updateActivity = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    const { title } = req.body;

    try {
        const updatedNode = await prisma.activity.update({
            where: { id: id },
            data: { title }
        });

        return res.json(updatedNode);
    } catch (error) {
        console.error("Prisma Error:", error);
        return res.status(500).json({ error: "Sikertelen mentés az adatbázisba." });
    }
};
export const removeActivity = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    try {
        const existing = await prisma.activity.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "A tevékenység már nem létezik" });
        }

        await prisma.activity.delete({
            where: { id }
        });

        res.json({ message: "Sikeres törlés", id });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Hiba történt a törlés során. Ellenőrizd, hogy nem tartozik-e hozzá feladat!" });
    }
};

// --- Tasks ---
export const getTasks = async (_req: Request, res: Response) => {
    try {
        const nodes = await prisma.task.findMany({
            include: {
                team: true,
                activity: true
            },
            orderBy: [
                { day: 'asc' },
                { timeOffset: 'asc' }
            ]
        });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: "Hiba a beosztások lekérésekor" });
    }
};
export const getTask = async (req: Request, res: Response) => {
    return res.status(501);

    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: "Érvénytelen azonosító" });
    }
    
    try {
        const node = await prisma.task.findUnique({
            where: { id },
            include: {
                team: true,
                activity: true
            }
        });
        if (!node) return res.status(404).json({ error: "Bejegyzés nem található" });
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: "Hiba a lekérés során" });
    }
};
export const createTask = async (req: Request, res: Response) => {
  try {
    const { day, timeOffset, teamIds, activityIds } = req.body;

    if (!day || timeOffset === undefined || !Array.isArray(teamIds) || !Array.isArray(activityIds)) {
      return res.status(400).json({ error: "Hiányzó adatok vagy érvénytelen formátum!" });
    }

    // Nap normalizálása UTC 12:00-ra
    const utcDay = normalizeToUtcNoon(day);

    const createdTasks: any[] = [];

    // Ciklusban futtatjuk, hogy egyenként tudjuk ellenőrizni a létezést
    for (const tId of teamIds) {
      for (const aId of activityIds) {
        
        // 1. Megnézzük, létezik-e már pontosan ez a bejegyzés
        const existing = await prisma.task.findFirst({
          where: {
            day: utcDay,
            timeOffset: Number(timeOffset),
            teamId: Number(tId),
            activityId: Number(aId)
          }
        });

        // 2. Ha nem létezik, csak akkor hozzuk létre
        if (!existing) {
          const newTask = await prisma.task.create({
            data: {
              day: utcDay,
              timeOffset: Number(timeOffset),
              teamId: Number(tId),
              activityId: Number(aId)
            },
            include: {
              team: true,
              activity: true
            }
          });
          createdTasks.push(newTask);
        }
      }
    }

    // Visszaküldjük az ÚJONNAN létrehozott elemeket (lehet üres tömb is, ha minden létezett)
    res.status(201).json(createdTasks);

  } catch (error) {
    console.error("Task Create Error:", error);
    res.status(500).json({ error: "Hiba a mentés során." });
  }
};
export const removeTask = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: "Érvénytelen azonosító" });
    }

    try {
        const existing = await prisma.task.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "A feladat már nem létezik" });
        }

        await prisma.task.delete({ where: { id } });
        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: "Hiba a törlés során." });
    }
};

// --- Brings ---
export const getBrings = async (_req: Request, res: Response) => {
    try {
        const nodes = await prisma.bring.findMany({
            orderBy: {
                title: "asc"
            }
        });
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: "Hiba az elemek lekérésekor" });
    }
};
export const createBring = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    const newNode = await prisma.bring.create({
      data: {
        title
      }
    });

    res.status(201).json(newNode);
  } catch (error) {
    console.error("Create Error:", error);
    res.status(400).json({ error: "Nem sikerült létrehozni az elemet" });
  }
};
export const removeBring = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: "Érvénytelen azonosító" });
    }

    try {
        const existing = await prisma.bring.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Az elem már nem létezik" });
        }

        await prisma.bring.delete({ where: { id } });
        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: "Hiba a törlés során." });
    }
};

// --- Programs ---
export const getPrograms = async (_req: Request, res: Response) => {
  try {
    const nodes = await prisma.program.findMany({
      orderBy: [
        { startDay: 'asc' },
        { startTimeOffset: 'asc' }
      ]
    });
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: "Hiba a programok lekérésekor" });
  }
};
export const getProgram = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }
    
    try {
        const node = await prisma.program.findUnique({
            where: { id }
        });
        if (!node) return res.status(404).json({ error: "Program nem található" });
        res.json(node);
    } catch (error) {
        res.status(500).json({ error: "Hiba a lekérés során" });
    }
};
export const createProgram = async (req: Request, res: Response) => {
  try {
    const { startDay, startTimeOffset, endDay, endTimeOffset, title, desc } = req.body;

    // Validáció (a desc opcionális)
    if (!startDay || startTimeOffset === undefined || !endDay || endTimeOffset === undefined || !title) {
      return res.status(400).json({ error: "A nap, időpont és cím megadása kötelező!" });
    }

    // Nap normalizálása UTC 12:00-ra
    const utcStart = normalizeToUtcNoon(startDay);
    const utcEnd = normalizeToUtcNoon(endDay);

    const newNode = await prisma.program.create({
        data: {
            startDay: utcStart,
            endDay: utcEnd,
            startTimeOffset: Number(startTimeOffset),
            endTimeOffset: Number(endTimeOffset),
            title,
            desc
        }
    });

    res.status(201).json(newNode);
  } catch (error) {
    console.error("Create Program Error:", error);
    res.status(400).json({ error: "Nem sikerült létrehozni a programot." });
  }
};
export const updateProgram = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    try {
        const { startDay, startTimeOffset, endDay, endTimeOffset, title, desc } = req.body;

        // Szigorú ellenőrzés: ha bármi hiányzik (kivéve a desc, ami lehet null), hiba
        if (!startDay || startTimeOffset === undefined || !endDay || endTimeOffset === undefined || !title) {
        return res.status(400).json({ error: "A nap, időpont és cím megadása kötelező!" });
        }

        // Nap normalizálása UTC 12:00-ra
        const utcStart = normalizeToUtcNoon(startDay);
        const utcEnd = normalizeToUtcNoon(endDay);

        const updatedNode = await prisma.program.update({
            where: { id },
            data: {
                startDay: utcStart,
                endDay: utcEnd,
                startTimeOffset: Number(startTimeOffset),
                endTimeOffset: Number(endTimeOffset),
                title,
                desc
            }
        });

        res.json(updatedNode);
    } catch (error) {
        console.error("Update Program Error:", error);
        res.status(500).json({ error: "Sikertelen frissítés az adatbázisban." });
    }
};
export const removeProgram = async (req: Request, res: Response) => {
    let id: number;
    try {
        id = parseId(req.params.id);
    } catch (err) {
        return res.status(400).json({ error: err });
    }

    try {
        const existing = await prisma.program.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "A program már nem létezik" });
        }

        await prisma.program.delete({ where: { id } });
        res.json({ message: "Program sikeresen törölve", id });
    } catch (error) {
        console.error("Delete Program Error:", error);
        res.status(500).json({ error: "Hiba történt a törlés során" });
    }
};

// --- Dashboard ---
export const GetDashboard = async (_req: Request, res: Response) => {
    try {
    const [teamCount, taskCount, contactCount, infoCount, activities, teams, upcoming] = await Promise.all([
      prisma.team.count(),
      prisma.task.count(),
      prisma.contact.count(),
      prisma.info.count(),
      // Tevékenységek eloszlása a Tremor DonutChart-hoz
      prisma.activity.findMany({
        include: { _count: { select: { tasks: true } } }
      }),
      // Csapatok terheltsége a Tremor BarChart-hoz
      prisma.team.findMany({
        include: { _count: { select: { tasks: true } } }
      }),
      // Közelgő 5 program
      prisma.program.findMany({
        where: { startDay: { gte: new Date() } },
        take: 5,
        orderBy: { startDay: 'asc' }
      })
    ]);

    const summary = {
      stats: {
        totalTeams: teamCount,
        totalTasks: taskCount,
        totalLeaders: contactCount,
        activeInfoCards: infoCount,
      },
      activityDistribution: activities.map(a => ({ name: a.title, count: a._count.tasks })),
      teamWorkload: teams.map(t => ({ teamName: t.name, taskCount: t._count.tasks })),
      upcomingPrograms: upcoming
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Hiba az adatok összesítésekor" });
  }
}