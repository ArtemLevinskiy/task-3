const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose
  .connect(
    "mongodb+srv://levinskiy2306_db_user:9Jn8qV3GbsxoiQNi@cluster0.wupqad3.mongodb.net/hotelDB?retryWrites=true&w=majority",
  )
  .then(() => console.log("Успішно підключено до MongoDB!"))
  .catch((err) => console.error("Помилка підключення до MongoDB:", err));

const hotelRoomSchema = new mongoose.Schema({
  roomNumber: { type: Number, required: true },
  roomType: { type: String, required: true },
  basePrice: { type: Number, required: true },
  status: { type: String, default: "FREE" },
  decorationStyle: { type: String, required: true },
});

const HotelRoom = mongoose.model("HotelRoom", hotelRoomSchema);

app.get("/", async (req, res) => {
  try {
    const rooms = await HotelRoom.find();
    res.send(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <title>Управління готельними номерами (ООБД)</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background-color: #f9f9f9; color: #333; }
                    h1, h2 { color: #2c3e50; }
                    ul { list-style-type: none; padding: 0; }
                    li { background: #fff; padding: 12px; margin-bottom: 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
                    form { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); max-width: 400px; margin-bottom: 20px; }
                    input { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
                    button { background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
                    button:hover { background: #2980b9; }
                    .delete-btn { color: #e74c3c; text-decoration: none; font-weight: bold; }
                    .search-box { background: #ecf0f1; }
                </style>
            </head>
            <body>
                <h1>Список готельних номерів (ООБД)</h1>

                <!-- БЛОК ПОШУКУ ДАНИХ -->
                <form class="search-box" action="/search" method="GET">
                    <h3>Пошук номерів</h3>
                    <input type="text" name="q" placeholder="Введіть тип чи стиль для пошуку..." required>
                    <button type="submit" style="background: #27ae60;">Знайти</button>
                </form>

                <ul>
                    ${
                      rooms.length > 0
                        ? rooms
                            .map(
                              (r) => `
                        <li>
                            <span><strong>Номер ${r.roomNumber}</strong> (${r.roomType}) — Стиль: ${r.decorationStyle} — Статус: ${r.status}</span>
                            <a class="delete-btn" href="/delete/${r.id}">[Видалити]</a>
                        </li>
                    `,
                            )
                            .join("")
                        : "<li>Список номерів порожній</li>"
                    }
                </ul>

                <h2>Додати новий номер</h2>
                <form action="/add" method="POST">
                    <input type="number" name="roomNumber" placeholder="Номер кімнати" required>
                    <input type="text" name="roomType" placeholder="Тип (Suite / Standard)" required>
                    <input type="number" name="basePrice" placeholder="Ціна" required>
                    <input type="text" name="decorationStyle" placeholder="Стиль декору (наприклад, Modern)" required>
                    <button type="submit">Додати запис</button>
                </form>
            </body>
            </html>
        `);
  } catch (err) {
    res.status(500).send("Помилка сервера при отриманні даних");
  }
});


app.post("/add", async (req, res) => {
  try {
    await HotelRoom.create({
      roomNumber: req.body.roomNumber,
      roomType: req.body.roomType,
      basePrice: req.body.basePrice,
      status: "FREE",
      decorationStyle: req.body.decorationStyle,
    });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Помилка при додаванні запису");
  }
});


app.get("/search", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const rooms = await HotelRoom.find({
      $or: [
        { roomType: { $regex: searchQuery, $options: "i" } },
        { decorationStyle: { $regex: searchQuery, $options: "i" } },
      ],
    });

    res.send(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <title>Результати пошуку</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background-color: #f9f9f9; color: #333; }
                    ul { list-style-type: none; padding: 0; }
                    li { background: #fff; padding: 12px; margin-bottom: 8px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    a { color: #3498db; text-decoration: none; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Результати пошуку для: "${searchQuery}"</h1>
                <a href="/">← Назад до головного списку</a>
                <ul>
                    ${
                      rooms.length > 0
                        ? rooms
                            .map(
                              (r) => `
                        <li>Номер ${r.roomNumber} (${r.roomType}) — Стиль: ${r.decorationStyle} — Статус: ${r.status}</li>
                    `,
                            )
                            .join("")
                        : "<p>Нічого не знайдено за вашим запитом.</p>"
                    }
                </ul>
            </body>
            </html>
        `);
  } catch (err) {
    res.status(500).send("Помилка при виконанні пошуку");
  }
});


app.get("/delete/:id", async (req, res) => {
  try {
    await HotelRoom.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Помилка при видаленні запису");
  }
});

app.listen(3000, () => {
  console.log("Веб-додаток успішно запущено на http://localhost:3000");
});