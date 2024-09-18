export const foreignKey = (attribute: string, references: { table: string; attribute: string }) => {
    let refernecesQuery = `FOREIGN KEY(${attribute}) REFERENCES ${references.table}(${references.attribute})`;

    return refernecesQuery;
}