export const constraint = (constraint, value) => {
    const types = {
        nullable: value ? ' NULL ' : ' NOT NULL ',
        unique: value ? ' UNIQUE ' : '',
        primaryKey: value ? ' PRIMARY KEY ' : '',
        default: value ? ' DEFAULT ' + value + ' ' : '',
        autoIncrement: value ? ' AUTO_INCREMENT ' : '',
        after: value ? ' AFTER ' + value : '',
    }

    return types[constraint];
}
