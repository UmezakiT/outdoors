const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

//load input validation
const validateProfileInput = require("../../validation/profile");
const validateActivitiesInput = require("../../validation/activities");

//load profile model
const Profile = require("../../models/Profile");
//load user profile
const User = require("../../models/User");

//route Get api/profile/test
// desc test profile route
//access Public
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

//route Get api/profile/test
// desc test profile route
//access Public
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
    .populate("user", ["name", "avatar"])
   
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);
//route get api/profile/all
// desc get all profiles
//access Public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "There are no profiles" }));
});

//route get api/profile/handle/:handle
// desc get pprofile by handle
//access Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(errors));
});

//route get api/profile/user/:user_id
// desc get pprofile by user id
//access Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id})
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

//route post api/profile
// desc create or edit user profile
//access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check validation
    if (!isValid) {
      //return any errors with 400 status
      return res.status(400).json(errors);
    }
    // get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;

    //skills - split into array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //social
    profileFields.social = {};
    if (req.body.youtube) profileFields.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.facebook = req.body.facebook;

    if (req.body.instagram) profileFields.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //update
        Profile.findByIdAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //create
        //check to see handle exist
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          //save profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

//route post api/profile/experience
// desc add experience to profile
//access Private
router.post(
  "/activities",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateActivitiesInput(req.body);

    //check validation
    if (!isValid) {
      //return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        location: req.body.location,
        description: req.body.description
      };

      //add to exp array
      profile.activities.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  }
);


//route delete api/profile/experience
// desc delete experience to profile
//access Private
router.delete(
  "/activities/:act_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateActivitiesInput(req.body);

    //check validation
    if (!isValid) {
      //return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // get removed index
        const removeIndex = profile.activities
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // splice out of the array
        profile.activities.splice(removeIndex, 1);

        //save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

//route delete api/profile/
// desc delete user and profile
//access Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
