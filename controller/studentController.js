const { response } = require('express')
const studentModel = require('../models/studentModel')
const classModel           = require('../models/classModel')
const userModel           = require('../models/User')
const { getPermissionSet } = require('./permissionAssinment');
const nodemailer = require('nodemailer');
const util = require('util');
const bcrypt        = require('bcryptjs')

//Show the list of student

const index = async (req, res, next) => {
   console.log("test",req.query);
   
    const permissionsResult = await getPermissionSet(req);
    if(permissionsResult.students.split("-").includes('RA')){

    try {
        const page = parseInt(req.query.PageNumber) || 1;
        const limit = parseInt(req.query.PageSize) || 10;
        const skip = (page - 1) * limit;
        const searchText = req.query.SearchText || '';

        let searchCondition = {
            InstutionCode: req.user.InstutionCode
        };
        

        if (req.query.status === 'Active') {
            searchCondition.Status = true;
        } else if (req.query.status === 'Inactive') {
            searchCondition.Status = false;
        }

        if (searchText) {
            searchCondition.$or = [
                { Contact_Number: { $regex: searchText, $options: 'i' } },
                { First_Name: { $regex: searchText, $options: 'i' } },
                { Last_Name: { $regex: searchText, $options: 'i' } },
                { Registration_Number: { $regex: searchText, $options: 'i' } },
                { Class: { $regex: searchText, $options: 'i' } },
                { InstutionCode: { $regex: searchText, $options: 'i' } }
            ];
        }

        const [students, totalCount] = await Promise.all([
            studentModel.find(searchCondition).skip(skip).limit(limit),
            studentModel.countDocuments(searchCondition)
        ]);

        res.status(200).json({
            success: true,
            message: "Data retrieved successfully",
            code: 200,
            totalRecords: totalCount,
            data: students.map(student => ({
                _id: student._id,
                Class: student.Class,
                Class_Code: student.Class_Code,
                Adhar: student.Adhar,
                Contact_Number: student.Contact_Number,
                Secondary_Contact: student.Secondary_Contact,
                Father_Name: student.Father_Name,
                Mother_Name: student.Mother_Name,
                Address: student.Address,
                State: student.State,
                District: student.District,
                First_Name: student.First_Name,
                Last_Name: student.Last_Name,
                Registration_Number: student.Registration_Number,
                Password: student.Password,
                DOB: student.DOB,
                Status: student.Status,
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'An error occurred!',
            code: 500,
            error: error.message
        });
    }
}else{
    
    res.status(401).json({
        code: 401,
        success: true,
        message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
    })
}
}


// Get student Id and Name
const getAllStudent = async (req, res, next) => {

    const permissionsResult = await getPermissionSet(req);
    if(permissionsResult.students.split("-").includes('R')){
        const studentRecord = await studentModel.find({
            Class: req.query.Class,
            InstutionCode: req.user.InstutionCode
        });
        let formattedRecords = studentRecord.map(student => ({
            StudentName: student.First_Name+student.Last_Name, 
            StudentId: student.Registration_Number          
        }));

        res.status(200).json({
            success: true,
            message: 'Student record retrieved successfully!',
            code: 200,
            data:formattedRecords
        });

     } else{
            res.status(401).json({
                code: 401,
                success: true,
                message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
            })
        }


}



// Get single Student Record

const show = async (req, res, next) => {
    const permissionsResult = await getPermissionSet(req);
    if(permissionsResult.students.split("-").includes('R')){

    
    let studentId = req.query.studentId;
    if(studentId == "null" || studentId == null || studentId == undefined){
       return res.status(400).json({
            success: false,
            message: "Please pass the Student Id",
            code: 400,
            data:[]
        })
    }
    studentModel.findById(studentId)
        .then(data => {
            res.status(200).json({
                success: true,
                message: "Data retrieved successfully",
                code: 200,
                data:data
            })
        })
        .catch(error => {
            res.status(400).json({
                message: `${error}`,
                status:400
            })
        })
    }else{
        res.status(401).json({
            code: 401,
            success: true,
            message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
        })
    }
}

// Get single Student Record by getStudentByRegisterationNumber

const getStudentByRegisterationNumber = async (req, res, next) => { 
    const permissionsResult = await getPermissionSet(req);
    if(!permissionsResult.students.split("-").includes('R')){
        return res.status(401).json({
            code: 401,
            success: true,
            message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
        })
    }

    const studentRecord = await studentModel.find({
        Registration_Number: req.query.registrationNumber,
        InstutionCode: req.user.InstutionCode
    });
    console.log(studentRecord);
    if(studentRecord.length === 0){
       return res.status(500).json({
            code: 500,
            success: false,
            message: 'Record Not Found'
        })
    }

    let formattedRecords = studentRecord.map(student => ({
        StudentName: student.First_Name+' '+student.Last_Name, 
        StudentId: student.Registration_Number,  
        Fathers_Name: student.Father_Name,
        Mothers_Name: student.Mother_Name,
        Class: student.Class,
        DOB: student.DOB,
        Adhar: student.Adhar,
        State: student.State,
        District: student.District,
        Address: student.Address,
        Address: student.Address,
        Contact_Number: student.Contact_Number,
        Secondary_Contact: student.Secondary_Contact,
        Attended_Classes: student.Attended_Classes,
        Total_Classes: student.Total_Classes,
        Class_Code: student.Class_Code,
        Email: student.Email
                        
    }));
    return res.status(200).json({
        code: 200,
        success: false,
        message: 'Record get Sucessfully',
        data:formattedRecords
    })

}
// Profile
const getStudentProfile = async (req, res, next) => { 
    const permissionsResult = await getPermissionSet(req);
    if(!permissionsResult.students.split("-").includes('R')){
        return res.status(401).json({
            code: 401,
            success: true,
            message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
        })
    }
    let studentProfile = {};
    const studentRecord = await studentModel.find({
        Registration_Number: req.query.registrationNumber,
        InstutionCode: req.user.InstutionCode
    });
    if(studentRecord.length === 0){
        return res.status(400).json({
             code: 400,
             success: false,
             message: 'Record Not Found'
         })
     }

    const userRecord = await userModel.find({
        MemberId: req.query.registrationNumber,
        InstutionCode: req.user.InstutionCode
    });
   
   studentProfile['Name'] = `${userRecord[0].FirstName} ${userRecord[0].LastName}` ;
   studentProfile['Phone'] = userRecord[0].Phone;
   studentProfile['Email'] = userRecord[0].Email;
   studentProfile['DOB'] = studentRecord[0].DOB;
   studentProfile['Adhar'] = studentRecord[0].Adhar;
   studentProfile['State'] = studentRecord[0].State;
   studentProfile['District'] = studentRecord[0].District;
   studentProfile['Address'] = studentRecord[0].Address;
   studentProfile['Secondary_Contact'] = studentRecord[0].Secondary_Contact;
   studentProfile['Class'] = studentRecord[0].Class;
   studentProfile['Registration_Number'] = studentRecord[0].Registration_Number;
   studentProfile['Attended_Classes'] = studentRecord[0].Attended_Classes;
   studentProfile['Total_Classes'] = studentRecord[0].Total_Classes;
   studentProfile['Father_Name'] = studentRecord[0].Father_Name;
   studentProfile['Mother_Name'] = studentRecord[0].Mother_Name;
   studentProfile['UserName'] = userRecord[0].UserName;
   studentProfile['InstutionName'] = userRecord[0].InstutionName;


   
    return res.status(200).json({
        code: 200,
        success: true,
        message: 'Record get Sucessfully',
        data:studentProfile
    })

}



// Add student to dataBase
const store = async (req, res, next) => {
    try {
        const permissionsResult = await getPermissionSet(req);
        
        // Check if permission is available
        if (permissionsResult.students.split("-").includes('W')) {
            
            const classRecord = await classModel.find({
                Class_Name: req.body.Class,
                Instution_Code: req.user.InstutionCode
            });
           
            if (classRecord.length === 0) {
                return res.status(401).json({
                    code: 401,
                    success: true,
                    message: 'Class does not exist!'
                });
            }
            const classCode = classRecord[0].Class_Code;
              
            let registrationNumber = req.body.Registration_Number;
               
                // Generate registration number if not provided
                if (registrationNumber === '' || registrationNumber === undefined) {
                    registrationNumber = await generateId(classRecord[0].Class_Name, req.user.InstutionCode);
                }
              
            const password = req.body.Password;

                if (!password) {
                    return res.status(400).json({
                        success: false,
                        message: "Password is required",
                        code: 400
                    });
                }

            // Create new student record
            let student = new studentModel({
                First_Name: req.body.First_Name,
                Last_Name: req.body.Last_Name,
                Class: req.body.Class,
                Class_Code: classCode,
                Secondary_Contact: req.body.Secondary_Contact,
                Adhar: req.body.Adhar,
                Father_Name: req.body.Father_Name,
                Mother_Name: req.body.Mother_Name,
                Contact_Number: req.body.Contact_Number,
                Address: req.body.Address,
                InstutionCode: req.user.InstutionCode,
                Attended_Classes: 0,
                Total_Classes: 0,
                Email: req.body.Email,
                Registration_Number: registrationNumber,
                DOB: req.body.DOB,
                State: req.body.State,
                District: req.body.District,
                OutstandingAmount: 0,
                Status: false
            });

           await student.save(); // Wait for student save to complete
            const hashedPass = await bcrypt.hash(password, 10);
            // Create corresponding user record
            let user = new userModel({
                FirstName: req.body.First_Name,
                LastName: req.body.Last_Name,
                Email: req.body.Email,
                Phone: req.body.Contact_Number,
                Password: hashedPass,
                UserName: req.body.Email,
                InstutionCode: req.user.InstutionCode,
                UserType: 'Student',
                PermissionSet: '',
                MemberId: registrationNumber,
                InstutionName: req.user.InstutionName
            });

            await user.save(); // Wait for user save to complete
            /////////////////////////////////////////////////////////////////
            let url = 'www.educationaleternity.com';
            let fullName = `${req.body.First_Name} ${req.body.Last_Name}`;
            await emailVerification(req.body.Email, fullName, req.user.InstutionName, req.body.Email, req.body.Password,url) 

            ///////////////////////////////////////////////////////
            // Send response after both student and user are saved
            return res.status(200).json({
                success: true,
                message: 'Student added successfully!',
                code: 200
            });
        } else {
            return res.status(401).json({
                code: 401,
                success: false,
                message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
            });
        }
    } catch (error) {
        // Handle any error in the try block
        console.error(error);
        return res.status(500).json({
            code: 500,
            success: false,
            message: `An error occurred: ${error.message}`
        });
    }
};


// update student record
const update = async (req, res, next) => {
    const permissionsResult = await getPermissionSet(req);
    if(permissionsResult.students.split("-").includes('E')){

    let studentId = req.body.studentId
    let updateData = {
        // RollNo : req.body.RollNo, // TODO this fild note requered
        First_Name: req.body.First_Name,
        Last_Name: req.body.Last_Name,
        Class: req.body.Class,
        Class_Code: req.body.Class_Code,
        Secondary_Contact: req.body.Secondary_Contact,
        Adhar: req.body.Adhar,
        Father_Name: req.body.Father_Name,
        Mother_Name: req.body.Mother_Name,
        Contact_Number: req.body.Contact_Number,
        Address: req.body.Address,
        // Performace_Update:req.body.Performace_Update, // TODO this fild note requered
        // Exctracaricular_Activity:req.body.Exctracaricular_Activity, // TODO this fild note requered
        Password: req.body.Password,
        Registration_Number: req.body.Registration_Number,
        DOB: req.body.DOB,
        State: req.body.State,
        District: req.body.District,
    }
    studentModel.findByIdAndUpdate(studentId, { $set: updateData })
        .then(response => {
            res.status(200).json({
                success: true,
                message: 'student details updated sucessfully',
                code: 200
            });
        })
        .catch(error => {
            res.status(401).json({
                success: false,
                message: `${error}`,
                code: 401
            });
        });
    }else{
        res.status(401).json({
            code: 401,
            success: true,
            message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
        })
    }
}

// deactivate student record
const remove = async (req, res, next) => {
    const permissionsResult = await getPermissionSet(req);
    if(permissionsResult.students.split("-").includes('D')){

    let studentId = req.body.studentId
    let updateData = {
        // RollNo : req.body.RollNo, // TODO this fild note requered
        Status: req.body.status,
        
    }
    studentModel.findByIdAndUpdate(studentId, { $set: updateData })
        .then(response => {
            res.status(200).json({
                success: true,
                message: 'User Removed Successfully!',
                code: 200
            });
        })
        .catch(error => {
            res.status(401).json({
                success: false,
                message: `${error}`,
                code: 401
            });
        });
    }else{
        res.status(401).json({
            code: 401,
            success: false,
            message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
        })
    }
}

// delete an Student

const destroy = async (req, res, next) => {
    const permissionsResult = await getPermissionSet(req);
    if(permissionsResult.students.split("-").includes('D')){

    let studentId = req.body.studentId
    studentModel.findByIdAndDelete(studentId)
        .then(response => {
            res.status(200).json({
                code: 200,
                success: true,
                message: 'Student Deleted sucessfully'
            })
        })
        .catch(error => {
            res.status(401).json({
                code: 401,
                success: false,
                message: 'An error occured!'
            })
        })
    }else{
        res.status(401).json({
            code: 401,
            success: false,
            message: 'You do not have the necessary permissions to access this resource. Please contact your administrator'
        })
    }
}

const generateId = async (className,instutionCode) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const yearString = String(year);
    const yearLastVal = yearString.slice(-2);

    const studentRecord = await studentModel.find({
        Class: className,
        InstutionCode: instutionCode
    });
    
    let nextRegistrationNumber;
    
    if (!studentRecord || studentRecord.length === 0) {
        nextRegistrationNumber = `${className}${yearLastVal}-001`;
    } else {
        const maxNumber = studentRecord
            .map(student => {
                const parts = student.Registration_Number?.split('-');
                return parts && parts[1] ? parseInt(parts[1], 10) : 0;
            })
            .reduce((max, num) => (num > max ? num : max), 0);
    
        const nextNumber = String(maxNumber + 1).padStart(3, '0');
        nextRegistrationNumber = `${className}${yearLastVal}-${nextNumber}`;
    }    
    return nextRegistrationNumber;
        
};

const emailVerification = async (email, fullName, institutionName, userName, password,url) => {
    // const otp = Math.floor(100000 + Math.random() * 900000);
    // Email verification template
   
    const mailStructure = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>User Credentials</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
                color: #333;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background-color: #007BFF;
                color: #ffffff;
                text-align: center;
                padding: 25px 10px;
            }
            .header h1 {
                font-size: 28px;
                margin: 0;
                font-weight: bold;
                letter-spacing: 1px;
            }
            .content {
                padding: 30px;
            }
            .content p {
                font-size: 16px;
                margin: 15px 0;
                color: #555;
                line-height: 1.6;
            }
            .credentials {
                margin: 20px 0;
                padding: 15px;
                background-color: #f4f8fc;
                border-radius: 8px;
                font-size: 16px;
                color: #333;
                border: 1px solid #ddd;
            }
            .credentials p {
                margin: 5px 0;
            }
            .footer {
                background-color: #f4f8fc;
                text-align: center;
                padding: 15px;
                font-size: 14px;
                color: #777;
            }
            .footer a {
                color: #007BFF;
                text-decoration: none;
                font-weight: 600;
            }
            .footer a:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to ${institutionName}</h1>
            </div>
            <div class="content">
                <p>Dear <strong>${fullName}</strong>,</p>
                <p>We are excited to have you on board! Below are your account credentials:</p>
                <div class="credentials">
                    <p><strong>Full Name:</strong> ${fullName}</p>
                    <p><strong>Username:</strong> ${userName}</p>
                    <p><strong>Password:</strong> ${password}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Institution Name:</strong> ${institutionName}</p>
                    <p><strong>Login URL:</strong> ${url}</p>
                </div>
                <p>Please keep this information secure and do not share your password with anyone. If you have any questions or encounter issues, feel free to contact us.</p>
            </div>
            <div class="footer">
                <p>Need help? Reach out to us at <a href="mailto:support@yourinstitution.com">support@yourinstitution.com</a>.</p>
                <p>&copy; ${new Date().getFullYear()} ${institutionName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Assuming otpManager is synchronous or properly awaited
    // const otpSaved = otpManager(email, otp);
    // if (!otpSaved) {
    //     return false; // OTP couldn't be saved
    // }
    

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ORGANIZATION_EMAIL,
            pass: process.env.ORGANIZATION_PASSWORD,
        },
    });

    // Promisify sendMail
    const sendMail = util.promisify(transporter.sendMail).bind(transporter);

    try {
        const emailOptions = {
            from: process.env.ORGANIZATION_EMAIL,
            to: email,
            subject: 'Email Verification',
            html: mailStructure,
        };

        await sendMail(emailOptions); // Await email sending
        return true; // Success
    } catch (error) {
        console.error('Error sending email:', error);
        return false; // Failure
    }
};

module.exports = {
    index, show, store, update, destroy, remove, getAllStudent, getStudentByRegisterationNumber,getStudentProfile
}