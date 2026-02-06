const constructorKey = Symbol("Exporter");

export class Exporter {

    #data;      // stores the flat json data
    #columns;   // stores the column order
    #result;    // stores the intermediate string

    constructor(passedKey) {
        if (passedKey !== constructorKey)
            throw new Error("Cannot create instance of Exporter using 'new', Call it's static methods ___ instead.");
    }

    static #validateAndSetInput(jsonData, columns) {
        // Check if data is provided and is an array
        if (jsonData !== undefined && !Array.isArray(jsonData))
            throw new Error("data must be an array");

        // Empty data + no columns = error
        if ((!jsonData || jsonData.length === 0) && !columns)
            throw new Error("empty data & no columns provided. cannot export.");

        // Validate all elements are non-null plain objects
        if (jsonData && jsonData.length > 0) {
            if (jsonData[0] === null || typeof jsonData[0] !== 'object' || Array.isArray(jsonData[0]))
                throw new Error(`data must be an array of plain objects`);
        }

        // Auto-detect columns from first row if not provided
        if (jsonData && jsonData.length > 0 && !columns)
            columns = Object.keys(jsonData[0]);

        // If still no columns (empty data case), use empty array
        if (!columns)
            columns = [];

        // Check for duplicate columns
        if (columns.length > 0 && new Set(columns).size !== columns.length)
            throw new Error("duplicate column names found");

        // Validate all columns exist in at least one row (warning only)
        if (jsonData && jsonData.length > 0 && columns.length > 0) {
            const dataCols = Object.keys(jsonData[0]);
            if (!(columns.every(col => dataCols.includes(col))))
                throw new Error(`provided columns do not match the data columns present
data keys: ${dataCols.join(", ")}
columns: ${columns.join(", ")}`);
        }

        const obj = new Exporter(constructorKey);
        obj.#data = jsonData || [];
        obj.#columns = columns;
        obj.#result = "";
        return obj;
    }

    show() {
        console.log(this.#result);
        return this;
    }

    download(fileName, mimeType = "text/plain") {
        if (!fileName)
            throw new Error("file name is required");

        const blob = new Blob([this.#result], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return this;
    }

    static toCSV(jsonData, columns) {
        const escapeValue = val => {
            if (val === undefined || val === null)
                return '""';
            const str = String(val);
            if (str.includes('"') || str.includes(",") || str.includes("\n"))
                return `"${str.replace(/"/g, '""')}"`;
            return `"${str}"`;
        };

        const obj = Exporter.#validateAndSetInput(jsonData, columns);

        const colLen = obj.#columns.length;
        let csvStr = "";

        let rowStr = "";
        for (let i = 0; i < colLen; i++)
            rowStr += escapeValue(obj.#columns[i]) + ",";

        csvStr += rowStr.substring(0, rowStr.length - 1) + "\n";

        for (let i = 0; i < obj.#data.length; i++) {
            rowStr = "";
            for (let j = 0; j < colLen; j++) {
                rowStr += escapeValue(obj.#data[i][obj.#columns[j]]) + ",";
            }
            csvStr += rowStr.substring(0, rowStr.length - 1) + "\n";
        }
        csvStr = csvStr.substring(0, csvStr.length - 1);

        obj.#result = csvStr;
        return obj;
    }

    static toHTML(jsonData, columns) {
        const escapeHTML = (val) => {
            if (val === undefined || val === null) return '';
            return String(val)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };

        const obj = Exporter.#validateAndSetInput(jsonData, columns);

        const colLen = obj.#columns.length;
        let htmlStr = "<table border='1'>";

        let rowStr = "<tr>";
        for (let i = 0; i < colLen; i++)
            rowStr += `<th>${escapeHTML(obj.#columns[i])}</th>`;

        htmlStr += rowStr + "</tr>";

        for (let i = 0; i < obj.#data.length; i++) {
            rowStr = "<tr>";
            for (let j = 0; j < colLen; j++) {
                rowStr += `<td>${escapeHTML(obj.#data[i][obj.#columns[j]])}</td>`;
            }
            htmlStr += rowStr + "</tr>";
        }
        htmlStr += "</table>";

        obj.#result = htmlStr;
        return obj;
    }

    static toXML(jsonData, columns) {
        const escapeXML = (val) => {
            if (val === undefined || val === null) return '';
            return String(val)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
        const sanitizeTag = (name) => {
            return name
                .replace(/\s+/g, '_')  // All spaces to underscore
                .replace(/[^a-zA-Z0-9_-]/g, '')  // Remove invalid chars
                .replace(/^[0-9]/, '_$&');  // Prepend _ if starts with number
        };

        const obj = Exporter.#validateAndSetInput(jsonData, columns);

        const colLen = obj.#columns.length;
        let xmlStr = `<?xml version="1.0" encoding="UTF-8"?><records>`;

        let rowStr = "";
        for (let i = 0; i < obj.#data.length; i++) {
            rowStr = "<row>";
            for (let j = 0; j < colLen; j++) {
                const sanitizedTag = sanitizeTag(obj.#columns[j]);
                rowStr += `<${sanitizedTag}>${escapeXML(obj.#data[i][obj.#columns[j]])}</${sanitizedTag}>`;
            }
            xmlStr += rowStr + "</row>";
        }
        xmlStr += "</records>";

        obj.#result = xmlStr;
        return obj;
    }
}