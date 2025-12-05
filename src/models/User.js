const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'operator', 'viewer'],
      default: 'operator',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for password (write-only)
userSchema.virtual('password').set(function (password) {
  this._password = password;
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (this._password) {
    this.passwordHash = await bcrypt.hash(this._password, 10);
    this._password = undefined;
  }
  next();
});

// Methods
userSchema.statics.findAll = async function () {
  return await this.find()
    .select('-passwordHash')
    .sort({ createdAt: -1 });
};

userSchema.statics.findById = async function (id) {
  return await this.findOne({ _id: id }).select('-passwordHash');
};

userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.create = async function (userData) {
  const { email, password, fullName, phone, role = 'operator' } = userData;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = new this({
    email,
    passwordHash,
    fullName,
    phone,
    role,
  });

  await user.save();

  // Return user without password hash
  const userObj = user.toObject();
  delete userObj.passwordHash;
  return userObj;
};

userSchema.statics.update = async function (id, userData) {
  const { email, fullName, phone, role, isActive } = userData;

  const updateData = {};
  if (email !== undefined) updateData.email = email;
  if (fullName !== undefined) updateData.fullName = fullName;
  if (phone !== undefined) updateData.phone = phone;
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;

  const user = await this.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
  return user;
};

userSchema.statics.updatePassword = async function (id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await this.findByIdAndUpdate(id, { passwordHash });
};

userSchema.statics.delete = async function (id) {
  const result = await this.findByIdAndDelete(id);
  return result !== null;
};

userSchema.statics.verifyPassword = async function (plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
