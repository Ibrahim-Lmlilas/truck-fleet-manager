const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

    role: {
        type: String,
        enum: ['admin', 'chauffeur'],
        required: [true, 'Le rôle est obligatoire'],
        default: 'chauffeur'
    },

    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email invalide']
    },

    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
        select: false
    },

    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },

    prenom: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        trim: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);