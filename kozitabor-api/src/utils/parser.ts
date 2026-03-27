export const parseId = (rawId: string | string[] | undefined) => {
    if (!rawId || typeof rawId !== 'string') {
        throw new Error("Hiányzó vagy érvénytelen ID paraméter.");
    }
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
        throw new Error("Az ID-nak számnak kell lennie!");
    }
    return id;
}