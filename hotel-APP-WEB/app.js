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
  clientName: { type: String, default: "" },
  clientPhone: { type: String, default: "" },
});
const HotelRoom = mongoose.model("HotelRoom", hotelRoomSchema);
app.get("/", async (req, res) => {
  try {
    const rooms = await HotelRoom.find();
    res.render("index", { rooms });
  } catch (err) {
    res.status(500).send("Помилка сервера");
  }
});
app.get("/book/:id", async (req, res) => {
  try {
    const room = await HotelRoom.findById(req.params.id);
    if (!room) return res.status(404).send("Номер не знайдено");
    res.render("book", { room });
  } catch (err) {
    res.status(500).send("Помилка");
  }
});
app.post("/book/:id", async (req, res) => {
  try {
    await HotelRoom.findByIdAndUpdate(req.params.id, {
      status: "BOOKED",
      clientName: req.body.clientName,
      clientPhone: req.body.clientPhone,
    });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Помилка при бронюванні");
  }
});
app.get("/cancel/:id", async (req, res) => {
  try {
    await HotelRoom.findByIdAndUpdate(req.params.id, {
      status: "FREE",
      clientName: "",
      clientPhone: "",
    });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Помилка при скасуванні бронювання");
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
    res.render("index", { rooms });
  } catch (err) {
    res.status(500).send("Помилка пошуку");
  }
});
app.listen(3000, () => {
  console.log("Додаток запущено на http://localhost:3000");
});