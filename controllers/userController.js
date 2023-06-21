import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import axios from "axios";
import xml2js from "xml2js";

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No user with id ${id}`);

    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { user } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No user with id ${id}`);

    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (isPasswordCorrect) {
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.status(200).json({ token, user });
      } else {
        return res.status(401).json({ message: "Invalid Credentials" });
      }
    } else return res.status(404).json({ message: "User does not exist" });
  } catch (error) {
    res.status(500).json({ message: "Something went Wrong" });
  }
};

export const signup = async (req, res) => {
  const user = req.body;
  try {
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    if (user.password !== user.confirmPassword)
      return res.status(409).json({ message: "Passwords don't match" });
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const newUser = new User({
      email: user.email,
      password: hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
      role: "trainee",
      level: "beginner",
    });
    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1hr" }
    );
    res.status(200).json({ token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No user with id ${id}`);

    await User.findByIdAndRemove(id);
    res.status(200).json(id);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const subscribe = async (req, res) => {
  const user = req.body;
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: `No user with id ${id}` });
    const updatedUser = await User.findByIdAndUpdate(id, user, {
      new: true,
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: "Could not subscribe" });
  }
};

export const unsubscribe = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ message: `No user with id ${id}` });
    const user = await User.findById(id);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...user?._doc, subscribed: false },
      {
        new: true,
      }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(404)
      .json({ message: "Could not unsubscribe!! Please try again later." });
  }
};

function getRandomItemsFromArray(arr, numItems) {
  const randomItems = [];

  while (randomItems.length < numItems) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    const randomItem = arr[randomIndex];

    if (!randomItems.includes(randomItem)) {
      randomItems.push(randomItem.replace(/\s/g, "").toLowerCase());
    }
  }

  return randomItems;
}

async function addResearchPaper(user, paperId) {
  try {
    await User.updateOne(
      { _id: user._id },
      { $push: { receivedPapers: paperId } }
    );
  } catch (error) {
    console.log(error);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertXML2JS(xml) {
  var finalResult;
  xml2js.parseString(xml.data, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }
    // Extract the entries from the parsed object
    const entries = result.feed.entry;
    // Convert each entry to JSON
    const jsonObjects = entries.map((entry) => {
      const jsonObject = {
        id: entry.id[0],
        updated: entry.updated[0],
        published: entry.published[0],
        title: entry.title[0],
        summary: entry.summary[0],
        authors: entry.author.map((author) => author.name[0]),
        // Add other properties you need from the XML
      };
      return jsonObject;
    });
    finalResult = jsonObjects;
  });
  return finalResult;
}

async function getPapers(url) {
  await delay(3000);
  return await axios.get(url).catch((error) => {
    console.log(error.message, "Error");
  });
}

export const sendEmails = async (oAuth2Client) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const users = await User.find();
    for (const user of users) {
      if (user.subscribed) {
        let researchPapersList = getRandomItemsFromArray(user.interests, 3);
        const url = `http://export.arxiv.org/api/query?search_query=all:${researchPapersList[0]}+OR+all:${researchPapersList[1]}+OR+all:${researchPapersList[2]}&start=0&max_results=10`;
        const xml = await getPapers(url);
        const jsonObjects = convertXML2JS(xml);
        for (let jsonObject of jsonObjects) {
          if (!user.receivedPapers.includes(jsonObject.id)) {
            const htmlMessage = `<h1> ${jsonObject.title} </h1>
                        <p> ${jsonObject.summary} </p>
                        <h6> Published On:  ${jsonObject.published} </h6>
                        <p> Authors : ${jsonObject.authors.map(
                          (a) => a + " "
                        )} </p>

                        <a href=${
                          jsonObject.id
                        }> Visit The Research Paper Website </a>
                        `;
            const transport = nodemailer.createTransport({
              service: "gmail",
              auth: {
                type: "OAuth2",
                user: "patilrahuld20@gmail.com",
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
              },
            });

            const mailOptions = {
              from: "Scholar Weekly <patilrahuld20@gmail.com>",
              to: user.email,
              subject: "Your Weekly Research Paper is Here",
              text: "Hello from gmail email using API",
              html: htmlMessage,
            };
            transport.sendMail(mailOptions, (error, result) => {
              if (error) {
                console.log(error);
              } else {
                console.log(result);
              }
              transport.close();
            });
            addResearchPaper(user, jsonObject.id);
            break;
          }
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
