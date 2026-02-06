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
            age: 42,
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
            name: "Bob<script>alert('xss')</script>",
            age: 30,
            city: "Seattle\nWashington",
            salary: 95000
        }
    ];

    console.log("CSV");
    Exporter.toCSV(data)
        .show()
    // .download("test-download.csv");

    console.log("\n\n");
    console.log("HTML");
    Exporter.toHTML(data)
        .show()
    // .download("test-download.html");

    console.log("\n\n");
    console.log("XML");
    Exporter.toXML(data)
        .show()
    // .download("test-download.xml");
}