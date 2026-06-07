const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const targetFolder = path.join(__dirname, 'user_data');
if (!fs.existsSync(targetFolder)){
    fs.mkdirSync(targetFolder);
}

app.post('/save-location', (req, res) => {
    const { latitude, longitude, timestamp } = req.body;
    const fileName = `user_${Date.now()}.txt`;
    const filePath = path.join(targetFolder, fileName);
    const fileContent = `--- USER LOCATION DETAILS ---\nDate/Time: ${timestamp}\nLatitude: ${latitude}\nLongitude: ${longitude}\n`;

    fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
            console.error("Failed to write file", err);
            return res.status(500).send("Error saving data");
        }
        console.log(`Saved new user details to: ${filePath}`);
        res.status(200).send("Data stored successfully");
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
