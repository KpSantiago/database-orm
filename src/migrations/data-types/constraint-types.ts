export const constraint = (constraint: string, value: any) => {
    const types: { [x: string]: string } = {
        nullable: value ? ' NULL ' : ' NOT NULL ',
        unique: value ? ' UNIQUE ' : '',
        primaryKey: value ? ' PRIMARY KEY ' : '',
        default: value ? ' DEFAULT ' + value + ' ' : '',
        autoIncrement: value ? ' AUTO_INCREMENT ' : '',
        after: value ? ' AFTER ' + value : '',
    }

    return types[constraint];
}
