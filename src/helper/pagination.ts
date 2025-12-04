export function getPaginationRange(page?: number, limit?: number): { from: number; to: number } {
    const currentPage = page && page > 0 ? page : 1;
    const currentLimit = limit && limit > 0 ? limit : 10;

    const from = (currentPage - 1) * currentLimit;
    const to = from + currentLimit - 1;

    return { from, to };
}
