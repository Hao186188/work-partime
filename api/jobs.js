import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

export default async function handler(req, res) {
  await connectDB();
  
  const JobSchema = new mongoose.Schema({
    title: String,
    company: String,
    salary: String,
    location: String
  });
  const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

  if (req.method === 'GET') {
    const jobs = await Job.find();
    return res.status(200).json(jobs);
  }

  if (req.method === 'POST') {
    const job = new Job(req.body);
    await job.save();
    return res.status(201).json({ message: 'Job added!' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
