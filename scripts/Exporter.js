import { download } from "./download.js";

const constructorKey = Symbol("Exporter");

export class Exporter {

    #data;      // stores the flat json data
    #columns;   // stores the column order
    #result;    // stores the intermediate string
    #mimeType;  // stores the mime type of file for downloading

    constructor(passedKey) {
        if (passedKey !== constructorKey)
            throw new Error("Cannot create instance of Exporter using 'new', Call its static methods toCSV, toJSON, toHTML, toXLS, or toXML instead.");
    }

    get result() {
        return this.#result;
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

        // Validate all columns exist in at least one row
        if (jsonData && jsonData.length > 0 && columns.length > 0) {
            const dataCols = Object.keys(jsonData[0]);
            if (!(columns.every(col => dataCols.includes(col))))
                throw new Error(`provided columns do not match the data columns present
data keys: ${dataCols.join(", ")}
columns: ${columns.join(", ")}`);
        }

        // allows only specific data types to be exported
        if (jsonData && jsonData.length > 0 && columns.length > 0) {
            columns.forEach(col => {
                const val = jsonData[0][col],
                    type = typeof val;

                const isAllowed = val instanceof Date || val === null ||
                    type === "string" || type === "number" ||
                    type === "boolean" || type === "undefined" ||
                    type === "bigint";

                if (!isAllowed)
                    throw new Error("Object values must be one of: Date, null, string, number, boolean, undefined, bigint.");
            });
        }

        const obj = new Exporter(constructorKey);
        obj.#data = jsonData || [];
        obj.#columns = columns;
        obj.#result = "";
        obj.#mimeType = "text/plain";
        return obj;
    }

    show() {
        console.log(this.#result);
        return this;
    }

    download(fileName, mimeType) {
        if (!mimeType)
            mimeType = this.#mimeType;

        download(this.#result, fileName, mimeType);
        return this;
    }

    static toJSON(jsonData, columns) {
        const obj = Exporter.#validateAndSetInput(jsonData, columns);

        const filtered = obj.#data.map(row => {
            const newRow = {};
            obj.#columns.forEach(col => newRow[col] = row[col]);
            return newRow;
        });

        obj.#result = JSON.stringify(filtered, null, 2);
        obj.#mimeType = "application/json";
        return obj;
    }

    static toXLS(jsonData, columns) {
        const obj = Exporter.toHTML(jsonData, columns);
        obj.#mimeType = 'application/vnd.ms-excel';
        return obj;
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
        const csvArr = [];

        let rowArr = [];
        for (let i = 0; i < colLen; i++)
            rowArr.push(escapeValue(obj.#columns[i]));

        csvArr.push(rowArr.join(","));

        for (let i = 0; i < obj.#data.length; i++) {
            rowArr = [];
            for (let j = 0; j < colLen; j++) {
                rowArr.push(escapeValue(obj.#data[i][obj.#columns[j]]));
            }
            csvArr.push(rowArr.join(","));
        }

        obj.#result = csvArr.join("\n");
        obj.#mimeType = "text/csv";
        return obj;
    }

    static toHTML(jsonData, columns, doEscapeHTML = true) {
        const escapeHTML = (val) => {
            if (!doEscapeHTML) return val;
            if (val === undefined || val === null) return '';
            return String(val)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };

        const obj = Exporter.#validateAndSetInput(jsonData, columns);

        const colLen = obj.#columns.length;
        const htmlArr = ["<table border='1'>"];

        let rowArr = [];
        for (let i = 0; i < colLen; i++)
            rowArr.push(`<th>${escapeHTML(obj.#columns[i])}</th>`);

        htmlArr.push(`<tr>${rowArr.join("")}</tr>`);

        for (let i = 0; i < obj.#data.length; i++) {
            rowArr = [];
            for (let j = 0; j < colLen; j++) {
                rowArr.push(`<td>${escapeHTML(obj.#data[i][obj.#columns[j]])}</td>`);
            }
            htmlArr.push(`<tr>${rowArr.join("")}</tr>`);
        }
        htmlArr.push("</table>");

        obj.#result = htmlArr.join("");
        obj.#mimeType = "text/html";
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
        const xmlArr = [`<?xml version="1.0" encoding="UTF-8"?><records>`];

        for (let i = 0; i < obj.#data.length; i++) {
            const rowStr = [];
            for (let j = 0; j < colLen; j++) {
                const sanitizedTag = sanitizeTag(obj.#columns[j]);
                if (!sanitizedTag)
                    throw new Error(`column "${obj.#columns[j]}" produces invalid XML tag name`);

                rowStr.push(`<${sanitizedTag}>${escapeXML(obj.#data[i][obj.#columns[j]])}</${sanitizedTag}>`);
            }
            xmlArr.push(`<row>${rowStr.join("")}</row>`);
        }
        xmlArr.push("</records>");

        obj.#result = xmlArr.join("");
        obj.#mimeType = "text/xml";
        return obj;
    }
}