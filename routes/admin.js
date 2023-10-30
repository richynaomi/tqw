const express = require('express');
const router = express.Router();
const User = require("../mongodb/schema/user");
const { enSuremainUser, ensureUnauthUser } = require("../middlewares/auth");
const transfer = require("../mongodb/schema/transfar")
const DoneTransfer = require("../mongodb/schema/transferredout")

// Simulated useradmin (you should retrieve this from a database)
const useradmin = 'required1233';

// Render the admin login page
router.get('/', async (req, res) => {
    res.render('admin/admin', { layout: 'admin' });
});


// Handle admin login form submission


// Define a route for /admin/dashboard
router.get('/dashboard', async (req, res) => {
    const users = await User.find().lean();
    res.render('admin/dashboard', { layout: 'admindashboard', isLoggedIn: req.isAuthenticated(), users });
});

router.post('/login',
async (req, res) => {
  const adminid = req.body.password;
  try {
      let errors = [];

      if (!adminid) {
          errors.push('Empty');
      }

      if (adminid !== useradmin) {
          errors.push('Wrong Access Id');
      }

      if (errors.length > 0) {
          res.redirect('/admin');
      } else {
          res.redirect('/admin/dashboard', );
          console.log("successful")
      }
  } catch (error) {
      console.log(error);

  }
});


router.post("/createaccount", async function (req, res) {
    try {
        let newUser = new User({
            accountNumber: req.body.accountNumber,
            firstName: req.body.firstname,
            Lastname: req.body.lastname,
            email: req.body.email,
            acctBalance: req.body.acctbalance,
            phoneNumber: req.body.phonenumber,
            dob: req.body.dateofbirth,
            nationalid: req.body.nationaliD,
            profilepicture: req.body.profilepicture,
            gender: req.body.gender,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            address: req.body.residentialaddress,
            Zipcode: req.body.zipcode,
            AccountType: req.body.accounttype,
            BeneficiaryLegalName: req.body.beneficiarylegalname,
            BeneficiaryOccupation: req.body.beneficiaryoccupation,
            BeneficiaryEmailAddress: req.body.beneficiaryemailaddress,
            BeneficiaryPhoneNumber: req.body.beneficiaryphonenumber,
            BeneficiaryResidentialAddress: req.body.nextofkinresidentialaddress,
            RelationshipwithBeneficiary: req.body.pleaseselectrelationship,
            BeneficiaryAge: req.body.pleaseselectage,
            password: req.body.txtPassword,
        });
        console.log(newUser)
        await newUser.save();
        console.log('added successfully');
        res.redirect('/admin/dashboard'); // Redirect to /admin/dashboard after creating a new user
    } catch (error) {
        console.log(error);
        res.redirect('/admin/dashboard');
    }
});

router.get('/addaccount', async (req, res) => {
    const transferr = await transfer.find().lean();
    res.render('admin/addaccount', { layout: 'admindashboard', isLoggedIn: req.isAuthenticated(), transferr });
});

router.get('/addtransaction', async (req, res) => {
    const doneTransfer = await DoneTransfer.find().lean()

    res.render('admin/creditdebit', { layout: 'admindashboard', isLoggedIn: req.isAuthenticated(), doneTransfer });
});



router.post("/addaccountt", async function (req, res) {
    try {
        let newUser = new transfer({
            country: req.body.country,
            bank: req.body.bankname,
            name: req.body.acctname,
            accounttno: req.body.acctnum,

            swiftcode: req.body.swiftcode
,
        });

        await newUser.save();
        console.log('added successfully');
        res.redirect('/admin/addaccount'); // Redirect to /admin/dashboard after creating a new user
    } catch (error) {
        console.log(error);
        res.redirect('/admin/addaccount');
    }
});

router.post("/createtransaction", async (req, res) => {
    try {
      const details = {
        senderAccountNo: req.body.senderaccountNumber,
        receiverAccountNo: req.body.recieveraccountNumber,
        amount: req.body.amount,
        receiverName: req.body.name,
        transacttype: req.body.transacttype,
        createdDate: req.body.datee,
      };
  
      console.log(details);
  
      // Find the sender account
      const senderAccount = await User.findOne({ accountNumber: details.senderAccountNo });
  
      if (!senderAccount) {
        // Sender account doesn't exist
        console.log('Sender account not found');
        res.redirect('/admin/addtransaction');
        return;
      }
  

  
      // Deduct the amount from the sender's account balance

      await senderAccount.save();
  
      // Create a new transaction record
      const newTransaction = new DoneTransfer({
        senderAccountNo: details.senderAccountNo,
        receiverAccountNo: details.receiverAccountNo,
        amount: details.amount,
        receiverName: details.receiverName,
        transacttype: details.transacttype,
        createdDate: details.createdDate,
        // Add other fields as needed
      });
  
      // Save the new transaction record
      await newTransaction.save();
      console.log('Transaction added successfully');
      res.redirect('/admin/addtransaction');
    } catch (error) {
      console.error(error);
      res.redirect('/admin/addtransaction');
    }
  });





router.get('/logout', (req, res) => {
    // Destroy the user's session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        } else {
            // Redirect the user to the login page or any
            // Redirect the user to the login page or any other appropriate page
            res.redirect('/admin');
        }
    });
});

module.exports = router;