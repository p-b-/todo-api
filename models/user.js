var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonWebToken');

module.exports = function(sequelize, DataTypes) {
  var user = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    salt: {
      type: DataTypes.STRING
    },
    password_hash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        len: [7, 100]
      },
      set: function(value) {
        var salt = bcrypt.genSaltSync(10);
        var hashedPassword = bcrypt.hashSync(value, salt);

        this.setDataValue('password', value);
        this.setDataValue('salt', salt);
        this.setDataValue('password_hash', hashedPassword);
      }
    }
  }, {
    hooks: {
      beforeValidate: function(user, options) {
        if (typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    classMethods: {
      authenticate: function(body) {
        return new Promise(function(resolve, reject) {
          if (typeof body.email !== 'string' ||
            typeof body.password !== 'string') {
            return reject();
          }

          user.findOne({
            where: {
              email: body.email
            }
          }).then(function(user) {
            if (!user || !bcrypt.compareSync(body.password,
                user.get(
                  'password_hash'))) {
              console.log('Failed hash');
              return reject();
            } else {
              console.log('Succeeded hash');
              resolve(user);
            }
          }, function(e) {
            console.log('Error: ' + e);
            reject();
          })
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function() {
        var json = this.toJSON();
        return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
      },
      generateToken: function(type) {
        if (!_.isString(type)) {
          return undefined;
        }
        try {
          var stringData = JSON.stringify({
            id: this.get('id'),
            type: type
          });
          var encryptedData = cryptojs.AES.encrypt(stringData,
            'abc123!@#@').toString();
          var token = jwt.sign({
            token: encryptedData
          }, 'asdfgh2232');
          return token;
        } catch (e) {
          return undefined;
        }
      }
    }
  });
  return user;
}
