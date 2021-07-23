import mongoose from 'mongoose';

const mentorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    students: [{
        type: String
    }]
})

const Mentor = mongoose.model('mentor', mentorSchema, 'mentors')

export default Mentor;