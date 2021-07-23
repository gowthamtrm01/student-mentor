import express from "express";
import Student from "./models/students.js";
import Mentor from "./models/mentor.js";
import mongoose from "mongoose";

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());

const url = process.env.MONGO_URL || "mongodb://localhost/movieData";

mongoose.connect(url, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const connect = mongoose.connection;

connect.on('open', () => console.log('MongoDB connnected'));

// Write API to create student

app.post('/create/student', (req, res) => {
    const student = req.body;
    Student.findOneAndUpdate({ 'name': student.name }, student, { upsert: true }, (err, doc) => {
        if (err) {
            return res.send(500, { error: err })
        }
        return res.send(doc);
    });
})

// Write API to create Mentor

app.post('/create/mentor', (req, res) => {
    const mentor = req.body;
    Mentor.findOneAndUpdate({ 'name': mentor['name'] }, mentor, { upsert: true }, (err, doc) => {
        if (err) {
            return res.send(500, { error: err })
        }
        return res.send(doc);
    });
})

// Write API to Assign a student to Mentor
// Select one mentor and Add multiple Student 
// A student who has a mentor should not be shown in List


app.post('/assign/mentor', async (req, res) => {
    const { mentor, students } = req.body;
    const match = await Mentor.findOne({ 'name': mentor });
    if (match) {
        const studentsFoundWithoutMentor = students.map(async (student) => {
            return await Student.findOne(
                {
                    "$and":
                        [
                            {
                                "name": student
                            },
                            {
                                "mentor": {
                                    "$exists": true,
                                    "$eq": ""
                                }
                            }
                        ]
                }
            )
        })
        Promise.all(studentsFoundWithoutMentor).then((data) => {
            const filteredStudents = data.filter(
                (item) => item && item !== undefined).map((item) => {
                    item['mentor'] = mentor
                    return item;
                });
            console.log("filter", filteredStudents);
            filteredStudents.forEach((item => {
                Student.findOneAndUpdate({ 'name': item['name'] }, item, { upset: true }, (err, doc) => {
                    console.log('Succesfully updated mentor name')
                })
                match.students.push(item['name'])
            }))
            Mentor.findOneAndUpdate({ 'name': match['name'] }, match, { upsert: true }, (err, doc) => {
                console.log('update students array', doc);
            })
            res.send(match);
        }).catch((error) => {
            res.status(500).send(error);
        })
    } else {
        res.status(500);
        res.send({ message: "There is no mentor" })
    }
})

// Write API to Assign or Change Mentor for particular Student
//     Select One Student and Assign one Mentor

app.post('/change', async (req, res) => {
    const { mentor, student } = req.body;
    const foundStudent = await Student.findOne({ 'name': student });
    const foundMentor = await Mentor.findOne({ 'name': mentor });
    if (foundStudent && foundMentor) {
        foundStudent["mentor"] = foundMentor["name"];
        foundMentor.students.push(foundStudent["name"]);
        Student.findOneAndUpdate({ 'name': foundStudent['name'] }, foundStudent, { upsert: true }, (err, doc) => {
            if (err) {
                return res.send(500, { error: err })
            }
            return res.send("Mentor changed succesfully")
        })
        Mentor.findOneAndUpdate({ 'name': foundMentor['name'] }, foundMentor, { upsert: true }, (err, doc) => {
            console.log(doc);
        })
    }
})

// Write API to show all students for a particular mentor

app.post("/list", async (req, res) => {
    const { mentor } = req.body;
    try {
        const foundMentor = await Mentor.findOne({ 'name': mentor });
        res.send(foundMentor);
    } catch (err) {
        res.status(500);
        res.send(err);
    }
})

app.listen(port, () => console.log(`Server was running at ${port}`))