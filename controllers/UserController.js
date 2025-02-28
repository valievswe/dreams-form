const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const XLSX = require("xlsx");

// Helper function to generate a PDF for a single user
const generateUserPDF = async (user, filePath) => {
  const pdfDoc = new PDFDocument({ size: "A4", layout: "landscape" });
  const writeStream = fs.createWriteStream(filePath);
  pdfDoc.pipe(writeStream);

  // Add header
  pdfDoc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("blue")
    .text("Dreams School", { align: "center" })
    .moveDown(1);

  // Add user data
  pdfDoc
    .fontSize(14)
    .font("Helvetica")
    .fillColor("black")
    .text(`F.I.O: ${user.full_name || "N/A"}`, { align: "left" })
    .text(
      `Tug'ilgan sana: ${
        moment(user.date_of_birth).format("DD MMM YYYY") || "N/A"
      }`,
      { align: "left" }
    )
    .text(`Telefon: ${user.phone || "N/A"}`, { align: "left" })
    .text(`Qayerdan: ${user.from_where || "N/A"}`, { align: "left" })
    .text(`Maktab: ${user.from_which_school || "N/A"}`, { align: "left" })
    .text(`Kirish sinfi: ${user.entrance_grade || "N/A"}`, { align: "left" })
    .text(`Qo'shimcha telefon: ${user.additional_phone || "N/A"}`, {
      align: "left",
    })
    .moveDown(2);

  // Add "TASDIQLANDI" message
  pdfDoc
    .fontSize(30)
    .font("Helvetica-Bold")
    .fillColor("green")
    .text("TASDIQLANDI", { align: "center" })
    .moveDown(2);

  // Add footer
  pdfDoc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("gray")
    .text("Generated on: " + new Date().toLocaleString(), { align: "center" });

  pdfDoc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
};

// Function to generate a PDF for all users
const generateAllUsersPDF = async () => {
  try {
    const users = await User.findAll();
    const pdfDir = path.resolve(__dirname, "../pdfs");

    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir);
    }

    const fileName = `all_users.pdf`;
    const filePath = path.join(pdfDir, fileName);

    const pdfDoc = new PDFDocument({ size: "A4", layout: "landscape" });
    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);

    // Add header
    pdfDoc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("blue")
      .text("Dreams School - Barcha Foydalanuvchilar", { align: "center" })
      .moveDown(1);

    // Add user data
    users.forEach((user, index) => {
      pdfDoc
        .fontSize(12)
        .font("Helvetica")
        .fillColor("black")
        .text(`${index + 1}. ${user.full_name} - ${user.phone}`, {
          align: "left",
        })
        .moveDown(0.5);
    });

    // Add footer
    pdfDoc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("gray")
      .text("Generated on: " + new Date().toLocaleString(), {
        align: "center",
      });

    pdfDoc.end();

    return filePath;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Create a new user
const createUser = async (userData, chatId, bot) => {
  try {
    // Check if the phone number already exists
    const existingUser = await User.findByPhone(userData.phone);
    if (existingUser) {
      bot.sendMessage(chatId, "❌ Bu telefon raqam ro'yxatdan o'tgan.");
      return;
    }

    // Insert the new user
    const newUser = await User.create(userData);

    // Generate PDF for the user
    const pdfDir = path.resolve(__dirname, "../pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir);
    }

    const fileName = `student_${newUser.phone}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    await generateUserPDF(newUser, filePath);

    // Send the PDF to the user
    if (fs.existsSync(filePath)) {
      await bot.sendDocument(chatId, fs.createReadStream(filePath), {
        filename: fileName,
        contentType: "application/pdf",
      });
      fs.unlinkSync(filePath); // Delete the file after sending
    }

    // Confirmation message
    bot.sendMessage(
      chatId,
      `${newUser.full_name} Dreams School uchun ro'yxatdan o'tkazildi.`
    );

    // Generate the updated PDF with all users
    await generateAllUsersPDF();
  } catch (error) {
    console.error("Error creating user:", error);
    bot.sendMessage(chatId, "❌ Ro'yxatdan o'tkazishda xatolik yuz berdi.");
  }
};

// Delete a user
const deleteUser = async (userId, chatId, bot) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      bot.sendMessage(chatId, "❌ Bunday ID ga ega foydalanuvchi topilmadi.");
      return;
    }

    await User.delete(userId);
    bot.sendMessage(chatId, `Foydalanuvchi ${user.full_name} o'chirildi.`);

    // Generate the updated PDF with all users
    await generateAllUsersPDF();
  } catch (error) {
    console.error("Error deleting user:", error);
    bot.sendMessage(
      chatId,
      "❌ Foydalanuvchini o'chirishda xatolik yuz berdi."
    );
  }
};

// Get users with pagination
const getUsersWithPagination = async (page, chatId, bot) => {
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const users = await User.findAll();
    const totalUsers = users.length;
    const paginatedUsers = users.slice(offset, offset + limit);

    if (paginatedUsers.length === 0) {
      bot.sendMessage(chatId, "❌ Foydalanuvchilar topilmadi.");
      return;
    }

    const userList = paginatedUsers
      .map(
        (user, index) =>
          `${offset + index + 1}. ${user.full_name} - ${user.phone} (ID: ${
            user.id
          })`
      )
      .join("\n");

    const keyboard = {
      inline_keyboard: [
        [
          { text: "⬅️ Oldingi", callback_data: `prev_page_${page}` },
          { text: `Sahifa ${page}`, callback_data: `current_page_${page}` },
          { text: "Keyingi ➡️", callback_data: `next_page_${page}` },
        ],
      ],
    };

    bot.sendMessage(
      chatId,
      `Foydalanuvchilar (${page}/${Math.ceil(
        totalUsers / limit
      )}):\n${userList}`,
      {
        reply_markup: keyboard,
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    bot.sendMessage(chatId, "❌ Foydalanuvchilarni olishda xatolik yuz berdi.");
  }
};

// Generate an Excel file with all users
const generateAllUsersExcel = async () => {
  try {
    const users = await User.findAll();
    const excelDir = path.resolve(__dirname, "../excel");

    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir);
    }

    // Prepare the data for Excel
    const excelData = users.map((user, index) => ({
      "№": index + 1,
      "F.I.O": user.full_name || "N/A",
      "Tug'ilgan sana": moment(user.date_of_birth).format("DD.MM.YYYY"),
      Telefon: user.phone || "N/A",
      Qayerdan: user.from_where || "N/A",
      Maktab: user.from_which_school || "N/A",
      Sinf: user.entrance_grade || "N/A",
      "Qo'shimcha telefon": user.additional_phone || "N/A",
      Status: "tasdiqlandi",
    }));

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 4 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "O'quvchilar ro'yxati");

    // Save the file
    const filePath = path.join(excelDir, "all_users.xlsx");
    XLSX.writeFile(workbook, filePath, {
      bookType: "xlsx",
      type: "binary",
    });

    console.log("Excel file generated successfully");
    return filePath;
  } catch (error) {
    console.error("Error generating Excel file:", error);
    throw error;
  }
};

module.exports = {
  createUser,
  deleteUser,
  getUsersWithPagination,
  generateAllUsersExcel,
  generateAllUsersPDF,
};
