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