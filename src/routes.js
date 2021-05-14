"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });

// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /doctors");
        var body = req.body;
        if (!body.name || !body.seasons || !body.ordering || !body.image_url){
            res.status(500).send({"Message":"Bad Data"});
        }
        else{
            Doctor.create(req.body).save()
            .then(doctor => {
                res.status(201).send(doctor);
            })
        }
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });

router.route("/doctors/:id")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
        .then(doctor => {
            res.status(200).send(doctor);
        })
        .catch(err => {
            res.status(404).send({"Message":"Doctor id not found."});
        })
    })
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        var body = req.body;
        Doctor.findById(req.params.id)
        .then(doctor => {
            var updates = {}
            if (body.name){
                updates["name"] = body.name;
            }
            if (body.seasons){
                updates["seasons"] = body.seasons;
            }
            if (body.image_url){
                updates["image_url"] = body.image_url;
            }
            if (body.ordering){
                updates["ordering"] = body.ordering;
            }
            Doctor.findByIdAndUpdate(req.params.id, updates, {new: true})
            .then(newDoc => {
                res.status(200).send(newDoc);
            })
        })
        .catch(err => {
            res.status(404).send({"Message":"Doctor id not found."});
        })
    })
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        Doctor.findOneAndDelete({ _id: req.params.id })
        .then(doctor => {
            res.status(200).send(null);
        })
        .catch(err => {
            res.status(404).send({"Message":"Doctor id not found."});
        })
    });

router.route("/doctors/:id/companions")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        Doctor.findById(req.params.id)
        .then(doctor => {
            Companion.find({})
            .then(companions => {
                var results = []
                for (var i = 0; i < companions.length; i++){
                    if (companions[i].doctors.includes(req.params.id)){results.push(companions[i]);}
                }
                res.status(200).send(results);
            })
        })
        .catch(err => {
            res.status(404).send({"Message":"Doctor id not found."});
        })
    });


router.route("/doctors/:id/goodparent")
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        Doctor.findById(req.params.id)
        .then(doctor => {
            Companion.find({})
            .then(companions => {
                for (var i = 0; i < companions.length; i++){
                    if (companions[i].doctors.includes(req.params.id) && !companions[i].alive){
                        res.status(200).send(false);
                        return;
                    }
                }
                res.status(200).send(true);
            })
        })
        .catch(err => {
            res.status(404).send({"Message":"Doctor id not found."});
        })
    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .sort('ordering')
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })
    .post((req, res) => {
        console.log("POST /companions");
        var body = req.body;
        if (!body.name || !body.character || !body.doctors || !body.seasons || !body.hasOwnProperty("alive") || !body.image_url || !body.ordering){
            res.status(500).send({"Message":"Bad Data"});
        }
        else{
            Companion.create(req.body).save()
            .then(companion => {
                res.status(201).send(companion);
            })
        }
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        Companion.find({})
        .then(companions => {
            var results = [];
            for (var i = 0; i < companions.length; i++){
                if (companions[i].doctors.length > 1){
                    results.push(companions[i]);
                }
            }
            res.status(200).send(results);
        })
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
        .then(companion => {
            res.status(200).send(companion);
        })
        .catch(err => {
            res.status(404).send({"Message":"Companion id not found."});
        })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        var body = req.body;
        Companion.findById(req.params.id)
        .then(companion => {
            Companion.findByIdAndUpdate(req.params.id, body, {new: true})
            .then(newCom => {
                res.status(200).send(newCom);
            })
        })
        .catch(err => {
            res.status(404).send({"Message":"Companion id not found."});
        })
    })
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        Companion.findOneAndDelete({_id:req.params.id})
        .then(companion => {
            res.status(200).send(null);
        })
        .catch(err => {
            res.status(404).send({"Message":"Companion id not found."});
        })
    });

router.route("/companions/:id/doctors")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);
        Companion.findById(req.params.id)
        .then(companion => {
            var doctors = companion.doctors;
            Doctor.find({"_id":{"$in": doctors}})
            .then(doctors => {
                res.status(200).send(doctors);
            })
            .catch(err => {
                res.status(404).send({"Message":"Doctor(s) listed under specified companion not found."});
            })
        })
        .catch(err => {
            res.status(404).send({"Message":"Companion id not found."});
        })
    });

router.route("/companions/:id/friends")
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);
        Companion.findById(req.params.id)
        .then(companion => {
            var seasons = companion.seasons;
            Companion.find({"_id":{"$ne": req.params.id}, "seasons": {"$in":seasons}})
            .then(companions => {
                res.status(200).send(companions);
            })
        })
        .catch(err => {
            res.status(404).send({"Message":"Companion id not found."});
        })
    });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;
