import { Exporter } from "../../scripts/Exporter.js";
import { readJSON } from "./readFile.js";

export async function main() {
    // const path = "./tests/resource/fake-details.json";
    // const data = await readJSON(path);

    const data = [
        {
            name: "Sam O'Brien",
            age: 45,
            city: "San Francisco",
            salary: null
        },
        {
            age: new Date(),
            name: 'Tony "The Tiger" Stark',
            city: "New York",
            salary: 150000
        },
        {
            name: "Alice",
            age: undefined,
            city: "Los Angeles, CA",
            salary: 120000
        },
        {
            name: "Bob<span style='background-color:red'>alert('xss')</span>",
            age: 30,
            city: "Seattle\nWashington",
            salary: 95000
        }
    ];

    // const data = [];

    csvtest(data);
    jsontest(data);
    xmltest(data);
    xlstest(data);
    htmlescapedtest(data);
    htmlnotescapedtest(data);
}

function htmlescapedtest(data) {
    console.log("\n\n");
    console.log("HTML -- escaped --");
    const x = Exporter.toHTML(data, ["name", "city", "age"]);
    x.show();
    document.body.innerHTML += x.result;
    // x.download("test-escaped.html");
}

function htmlnotescapedtest(data) {
    console.log("\n\n");
    console.log("HTML -- not escaped --");
    const x = Exporter.toHTML(data, ["name", "city", "age"], false);
    x.show();
    document.body.innerHTML += x.result;
    // x.download("test-notescaped.html");
}

function csvtest(data) {
    console.log("\n\n");
    console.log("CSV");
    Exporter.toCSV(data, ["name", "city", "age"])
        .show()
    // .download("test.csv");
}

function xlstest(data) {
    console.log("\n\n");
    console.log("XLS");
    Exporter.toXLS(data, ["name", "city", "age"])
        .show()
    // .download('table.xls', 'application/vnd.ms-excel');
}

function xmltest(data) {
    console.log("\n\n");
    console.log("XML");
    Exporter.toXML(data, ["name", "city", "age"])
        .show()
    // .download("test.xml");
}

function jsontest(data) {
    console.log("\n\n");
    console.log("JSON");
    Exporter.toJSON(data, ["name", "city", "age"])
        .show()
    // .download("test.json");
}