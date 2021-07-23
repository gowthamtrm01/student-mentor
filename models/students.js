import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mentor: {
        type: String,
        default: null
    }
})

const Student = mongoose.model('student', studentSchema, 'students')

export default Student;