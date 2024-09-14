export class MySQLDataTypes {
    // Numeric Types
    static get TINYINT() {
        return 'TINYINT';
    }

    static get SMALLINT() {
        return 'SMALLINT';
    }

    static get MEDIUMINT() {
        return 'MEDIUMINT';
    }

    static get INT() {
        return 'INT';
    }

    static get BIGINT() {
        return 'BIGINT';
    }

    // Floating-Point Types
    static get FLOAT() {
        return 'FLOAT';
    }

    static get DOUBLE() {
        return 'DOUBLE';
    }

    // String Types
    static get CHAR() {
        return 'CHAR';
    }

    static get VARCHAR() {
        return 'VARCHAR(255)';
    }

    static get TEXT() {
        return 'TEXT';
    }

    // Date and Time Types
    static get DATE() {
        return 'DATE';
    }

    static get DATETIME() {
        return 'DATETIME';
    }

    static get TIMESTAMP() {
        return 'TIMESTAMP';
    }

    static get NOW(){
        return 'now()';
    }

    // Other Types
    static get BOOLEAN() {
        return 'BOOLEAN';
    }

    static get ENUM() {
        return 'ENUM';
    }

}
