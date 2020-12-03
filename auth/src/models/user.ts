import mongoose, { Schema, model, Document } from 'mongoose';
import { Password } from '../services/password';

interface userAttrs {
  email: string;
  password: string;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(_, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
    },
    versionKey: false,
  }
});

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
});

const UserModel = model<Document & userAttrs>('User', userSchema);

class User extends UserModel {
  constructor(attrs: userAttrs) {
    super(attrs); 
  }
}

export { User };
