const express = require('express');
const router = express.Router();
const users = require("../mongodb/schema/user");
const { enSuremainUser, ensureUnauthUser } = require("../middlewares/auth");
const transfer = require("../mongodb/schema/transfar")
const DoneTransfer = require("../mongodb/schema/transferredout")



// Render the admin login page
router.get('/', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      // Handle the case where the user is not authenticated
      return res.status(401).send('User not authenticated');
    }

    // Access user data from req.user
    const user = await users.findOne({ _id: req.user._id }).lean()
    const doneTransfer = await DoneTransfer.find().lean()

    if (user || doneTransfer) {
      let formattedBalance;
      let formattedamount;

      if (typeof user.acctBalance === 'number') {
          // If it's a number, convert it to a string with commas
          formattedBalance = user.acctBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });

      }else if (doneTransfer.amount === 'number'){
        formattedamount = doneTransfer.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
      }
      else {
          // Assume it's already a string
          formattedBalance = user.acctBalance;
          formattedamount = doneTransfer.amount
      }
    // Render the user's dashboard with their details
    res.render('user/dashboard', { layout: 'userdashboard', user, doneTransfer, formattedBalance, formattedamount });}
  } catch (error) {
    console.error(error);
    // Handle errors appropriately, e.g., render an error page
    res.status(500).send('Internal Server Error');
  }
});

router.get('/tranfertofincch', async (req, res) => {
  if (!req.isAuthenticated()) {
    // Handle the case where the user is not authenticated
    return res.status(401).send('User not authenticated');
  }

  const user = await users.findOne({ _id: req.user._id }).lean()

  const errorMessage = req.query.errorMessage;

  if (user) {
    let formattedBalance;

    if (typeof user.acctBalance === 'number') {
        // If it's a number, convert it to a string with commas
        formattedBalance = user.acctBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    } else {
        // Assume it's already a string
        formattedBalance = user.acctBalance;
    }

  res.render('user/transfar', { layout: 'userdashboard', user, errorMessage, formattedBalance  });}
});

router.get('/tranfertocommercialbank', async (req, res) => {
  if (!req.isAuthenticated()) {
    // Handle the case where the user is not authenticated
    return res.status(401).send('User not authenticated');
  }

  const user = await users.findOne({ _id: req.user._id }).lean()
  const errorMessage = req.query.errorMessage
  if (user) {
    let formattedBalance;

    if (typeof user.acctBalance === 'number') {
        // If it's a number, convert it to a string with commas
        formattedBalance = user.acctBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    } else {
        // Assume it's already a string
        formattedBalance = user.acctBalance;
    }

  res.render('user/commercialbank', { layout: 'userdashboard', user, errorMessage, formattedBalance: formattedBalance });
  }
});

router.get('/transactionreciept', async (req, res) => {
  if (!req.isAuthenticated()) {
    // Handle the case where the user is not authenticated
    return res.status(401).send('User not authenticated');
  }

  const user = await users.findOne({ _id: req.user._id }).lean()

  // Retrieve the doneTransfer details from the query parameter and parse it
  const doneTransfer = JSON.parse(req.query.doneTransfer);
  if (doneTransfer) {
    let formattedBalance;

    if (typeof doneTransfer.amount === 'number') {
        // If it's a number, convert it to a string with commas
        formattedBalance = doneTransfer.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
    } else {
        // Assume it's already a string
        formattedBalance = user.acctBalance;
    }

  res.render('user/processedtransfer', { layout: 'processtransfer', user, doneTransfer, formattedBalance });}
});



router.post('/transferToOtherBank', async(req, res) => {
  const otherbankBankName = req.body.otherbankBankName;
  const otherbankAcctNo = req.body.otherbankAcctNo;
  const otherBankAmount = req.body.otherBankAmount;

  const user = await users.findOne({ _id: req.user._id })

  /// Perform your validation and logic here
// For example, check if the account details are correct and if not, send an error message

let errorMessage = '';

  if (otherBankAmount > user.acctBalance) {
    errorMessage = 'INSUFFICIENT BALANCE';
  } else if (otherbankBankName === '' || otherbankAcctNo === '' || otherBankAmount === '') {
    errorMessage = 'Enter all required input!';
  } else {
    errorMessage = 'Invalid Account No!';
  }

  // Check if an error message is set
  if (errorMessage) {
    res.redirect('/dashboard/tranfertofincch?errorMessage=' + encodeURIComponent(errorMessage));
  }

});

router.post('/transfertocommercialbank', async (req, res) => {

  const transactionpin = "12356";
  let Fortransfers = {
    receivcountry: req.body.receivercountry,
    receivebaank: req.body.receiverbank,
    receivname: req.body.receivername,
    receivacct: req.body.receiveraccounttno,
    receivswiftcode: req.body.receiverswiftcode,
    amount: parseFloat(req.body.receiveramount),
    descriptionn: req.body.description, // Parse the amount as a float
    transactionpin: req.body.transactionpin
  };

  const user = await users.findOne({ _id: req.user._id });
  const transferr = await transfer.findOne({ country: Fortransfers.receivcountry }).lean();

  let errorMessage = '';

  console.log("Fortransfers:", Fortransfers);
  console.log("transferr:", transferr);

  if (Fortransfers.amount > user.acctBalance) {
    errorMessage = 'INSUFFICIENT BALANCE';
  } else if (
    Fortransfers.receivcountry !== transferr.country ||
    Fortransfers.receivebaank !== transferr.bank ||
    Fortransfers.receivname !== transferr.name ||
    Fortransfers.receivacct !== transferr.accounttno ||
    Fortransfers.receivswiftcode !== transferr.swiftcode
  ) {
    errorMessage = "Invalid Commercials Details"
    //'   Unfortunately, we were unable to process your transaction at this time. It appears that you have reached your monthly transaction limit of three, as you have not yet completed your most recent verification.We understand the importance of this matter to you and would like to assist you promptly. To learn more about your account status and the verification process, please do not hesitate to reach out to our customer support team. We are here to help you'
    console.log("Comparison failed at: ", errorMessage);
  }else if (Fortransfers.transactionpin !== transactionpin){
    errorMessage = "Incorrect Transaction Pin"

    //'Unfortunately, we were unable to process your transaction at this time. It appears that you have reached your monthly transaction limit of three, as you have not yet completed your most recent verification.We understand the importance of this matter to you and would like to assist you promptly. To learn more about your account status and the verification process, please do not hesitate to reach out to our customer support team. We are here to help you';

    console.log(errorMessage);
  }else {
    // Calculate the remaining balance
    const remainingBalance = user.acctBalance - Fortransfers.amount;

    // Update the user's current balance in the database
    user.acctBalance = remainingBalance;
    await user.save();

    // Create a new DoneTransfer document
    const doneTransfer = new DoneTransfer({
      senderAccountNo: user.accountNumber,
      receiverCountry: Fortransfers.receivcountry,
      receiverBank: Fortransfers.receivebaank,
      receiverName: Fortransfers.receivname,
      receiverAccountNo: Fortransfers.receivacct,
      receiverSwiftCode: Fortransfers.receivswiftcode,
      amount: Fortransfers.amount,
      Description:Fortransfers.descriptionn
    });

    try {
      // Save the new DoneTransfer document
      await doneTransfer.save();
      console.log(`Transfer done: ${doneTransfer}`);
      return res.redirect('/dashboard/transactionreciept?doneTransfer=' + encodeURIComponent(JSON.stringify(doneTransfer)));
    } catch (error) {
      console.log(error);
      errorMessage = 'Error saving the transaction';
    }
  }

  // Check if an error message is set
  if (errorMessage) {
    res.redirect('/dashboard/tranfertocommercialbank?errorMessage=' + encodeURIComponent(errorMessage));
  }
});


router.get('/logoutuser', (req, res) => {
  // Destroy the user's session
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
      } else {
          // Redirect the user to the login page or any
          // Redirect the user to the login page or any other appropriate page
          res.redirect('/');
      }
  });
});



module.exports = router;
