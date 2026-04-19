const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    age: {
      type: Number,
      min: [1, 'Age must be at least 1'],
      max: [120, 'Age cannot exceed 120'],
      default: null,
    },
    department: {
      type: String,
      enum: ['engineering', 'design', 'marketing', 'sales', 'hr', null, ''],
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ name: 'text', email: 'text' });
userSchema.index({ department: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
