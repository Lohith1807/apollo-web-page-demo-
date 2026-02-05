const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Connection URI - Update this with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

// Define Subject Schema
const subjectSchema = new mongoose.Schema({
    department: String,
    specialization: String,
    semester: String,
    theory: [String],
    labs: [String],
    createdAt: { type: Date, default: Date.now }
});

const Subject = mongoose.model('Subject', subjectSchema);

async function insertSubjectsData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read the subjects JSON file
        const subjectsFilePath = 'C:\\Users\\lohit\\Downloads\\apollo-web\\server\\data\\subjects.json';
        const subjectsData = JSON.parse(fs.readFileSync(subjectsFilePath, 'utf8'));

        let totalInserted = 0;

        // Iterate through departments
        for (const [department, specializations] of Object.entries(subjectsData)) {
            console.log(`\n📚 Processing Department: ${department}`);

            // Iterate through specializations
            for (const [specialization, semesters] of Object.entries(specializations)) {
                console.log(`  📖 Specialization: ${specialization}`);

                // Iterate through semesters
                for (const [semester, data] of Object.entries(semesters)) {
                    const subjectDoc = {
                        department,
                        specialization,
                        semester,
                        theory: data.theory || [],
                        labs: data.labs || []
                    };

                    try {
                        const result = await Subject.create(subjectDoc);
                        totalInserted++;
                        console.log(`    ✅ ${semester} - Inserted successfully (ID: ${result._id})`);
                    } catch (error) {
                        console.error(`    ❌ Error inserting ${semester}:`, error.message);
                    }
                }
            }
        }

        console.log(`\n✨ Data insertion complete! Total records inserted: ${totalInserted}`);

    } catch (error) {
        console.error('Connection error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the insertion
insertSubjectsData();
