export async function readJSON(path) {
    try {
        let data = await fetch(path);
        data = await data.json();
        return data;
    } catch (error) {
        console.error(`Error reading ${path}: ${error}`);
        return null;
    }
}
