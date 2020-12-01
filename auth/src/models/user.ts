import mongoose from 'mongoose';
import { Password } from '../services/password';

interface userAttrs {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
})

const UserModel = mongoose.model<mongoose.Document & userAttrs>('User', userSchema);

class User extends UserModel {
  constructor(attrs: userAttrs) {
    super(attrs); 
  }
}

export { User };
