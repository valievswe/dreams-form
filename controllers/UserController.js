const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const XLSX = require("xlsx");

const createUser = async (userData, chatId, bot) => {
  const {
    fullName,
    dateOfBirth,
    phone,
    fromWhere,
    fromWhichSchool,
    entranceGrade,
    additionalPhone,
  } = userData;

  try {
    // Check if the phone number already exists
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      bot.sendMessage(chatId, "❌ Bu telefon raqam ro'yxatdan o'tgan.");
      return;
    }

    // Insert the new user
    const newUser = await User.create({
      fullName,
      dateOfBirth,
      phone,
      fromWhere,
      fromWhichSchool,
      entranceGrade,
      additionalPhone,
    });

    console.log("New user created:", newUser.full_name);

    // Ensure the 'pdfs' directory exists in the root folder
    const pdfDir = path.resolve(__dirname, "../pdfs"); // Absolute path to root's pdfs folder
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir); // Create 'pdfs' directory if it doesn't exist
    }

    // Generate PDF for the user
    const pdfDoc = new PDFDocument({ size: "A4", layout: "landscape" });
    const fileName = `student_${phone}.pdf`;
    const filePath = path.join(pdfDir, fileName);

    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);

    // Add header
    pdfDoc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("blue")
      .text("Dreams School", { align: "center" })
      .moveDown(1);

    // Format the date of birth
    const formattedDateOfBirth = moment(newUser.date_of_birth).format(
      "DD MMM YYYY"
    );

    // Add user data to the PDF
    pdfDoc
      .fontSize(14)
      .font("Helvetica")
      .fillColor("black")
      .text(`F.I.O: ${newUser.full_name || "N/A"}`, { align: "left" })
      .text(`Tug'ilgan sana: ${formattedDateOfBirth || "N/A"}`, {
        align: "left",
      })
      .text(`Telefon: ${newUser.phone || "N/A"}`, { align: "left" })
      .text(`Qayerdan: ${newUser.from_where || "N/A"}`, { align: "left" })
      .text(`Maktab: ${newUser.from_which_school || "N/A"}`, { align: "left" })
      .text(`Kirish sinfi: ${newUser.entrance_grade || "N/A"}`, {
        align: "left",
      })
      .text(`Qo'shimcha telefon: ${newUser.additional_phone || "N/A"}`, {
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

    // Add the school details
    pdfDoc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("black")
      .text("Dreams School", { align: "left" })
      .text("Telefon: +998959000407", { align: "left" })
      .text("Manzil: https://maps.app.goo.gl/bJJDFhc3p3hWdaRQ7", {
        align: "left",
      })
      .moveDown(1);

    // Add footer
    pdfDoc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("gray")
      .text("Generated on: " + new Date().toLocaleString(), {
        align: "center",
      });

    pdfDoc.end();

    // Wait for the PDF to be fully written
    writeStream.on("finish", async () => {
      try {
        // Check if the file exists before attempting to send it
        if (fs.existsSync(filePath)) {
          const fileOptions = {
            filename: fileName, // Specify the filename to send
            contentType: "application/pdf", // Explicitly specify the content type
          };

          await bot.sendDocument(
            chatId,
            fs.createReadStream(filePath),
            {},
            fileOptions
          );

          bot.sendMessage(
            chatId,
            `📍 Bizning manzil: [Dreams School](https://maps.app.goo.gl/bJJDFhc3p3hWdaRQ7)`
          );
        } else {
          bot.sendMessage(chatId, "Fayl topilmadi.");
        }
      } catch (err) {
        console.error("Error sending document:", err);
        bot.sendMessage(chatId, "Fayl yuborishda xatolik yuz berdi.");
      }
    });

    // Confirmation message to the user
    bot.sendMessage(
      chatId,
      `${newUser.full_name} Dreams School uchun ro'yxatdan o'tkazildi.`
    );

    // Generate the updated PDF with all users
    await generateAllUsersPDF();
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === "23505") {
      bot.sendMessage(chatId, "Bunday telefon raqam ro'yxatdan o'tgan.");
    } else {
      bot.sendMessage(chatId, "Ro'yxatdan o'tkazishda xatolik yuz berdi.");
    }
  }
};

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
    bot.sendMessage(chatId, "Foydalanuvchini o'chirishda xatolik yuz berdi.");
  }
};

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
    bot.sendMessage(chatId, "Foydalanuvchilarni olishda xatolik yuz berdi.");
  }
};

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
    const colWidths = [
      { wch: 4 }, // №
      { wch: 30 }, // F.I.O
      { wch: 15 }, // Tug'ilgan sana
      { wch: 15 }, // Telefon
      { wch: 20 }, // Qayerdan
      { wch: 25 }, // Maktab
      { wch: 10 }, // Sinf
      { wch: 15 }, // Qo'shimcha telefon
      { wch: 15 }, // Status
    ];
    worksheet["!cols"] = colWidths;

    // Style the headers (make them bold)
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const headerStyle = {
      font: {
        bold: true,
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[headerCell].s) worksheet[headerCell].s = {};
      worksheet[headerCell].s = headerStyle;
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "O'quvchilar ro'yxati");

    // Save the file
    const filePath = path.join(excelDir, "all_users.xlsx");
    XLSX.writeFile(workbook, filePath, {
      bookType: "xlsx",
      bookSST: false,
      type: "binary",
      cellStyles: true,
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
};
