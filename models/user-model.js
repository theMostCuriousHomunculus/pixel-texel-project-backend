const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  email: {
    lowercase: true,
    required: true,
    trim: true,
    type: String,
    unique: true
  },
  name: {
    maxlength: 30,
    required: true,
    trim: true,
    type: String,
    unique: true
  },
  password: {
    minlength: 4,
    required: true,
    trim: true,
    type: String
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
});

userSchema.methods.generateAuthenticationToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);

  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, enteredPassword) => {
  const user = await Account.findOne({ email })

  if (!user) {
    throw new Error('The provided email address and/or password were incorrect.  Please try again.');
  }

  const isMatch = await bcrypt.compare(enteredPassword, user.password);

  if (!isMatch) {
    throw new Error('The provided email address and/or password were incorrect.  Please try again.');
  }

  return user;
};

// hash the plain text password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = model('User', userSchema);

module.exports = {
  User
};