/**
 * Downloads data as a file in the browser.
 * @param {String} data The content to download
 * @param {String} fileName Name of the file to save (including extension)
 * @param {String} [mimeType="text/plain"] MIME type of the file. defaults to "text/plain"
 * @throws {Error} If data is empty or fileName is not provided
 *
 * @example
 * download("Hello World", "greeting.txt", "text/plain");
 * download(csvData, "report.csv", "text/csv");
 */
export function download(data, fileName, mimeType = "text/plain") {
    if (!data)
        throw new Error("data cannot be empty");
    if (!fileName)
        throw new Error("file name is required");

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}