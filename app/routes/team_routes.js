const express = require('express')

const passport = require('passport')

const Team = require('../models/team')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// Index Team
router.get('/teams', requireToken, (req, res, next) => {
  Team.find()
    .then(team => {
      return team.map(teams => teams.toObject())
    })
    .then(team => res.status(200).json({ team: team }))
    .catch(next)
})
// Show Team
router.get('/teams/:id', requireToken, (req, res, next) => {
  Team.findById(req.params.id)
  .then(handle404)
  .then(team => res.status(200).json({ team: team.toObject() }))
  .catch(next)
})
// Create Team
router.post('/teams', requireToken, (req, res, next) => {
  req.body.team.owner = req.user.id
  Team.create(req.body.team)
    .then(team => {
      res.status(201).json({ team: team.toObject() })
    })
    .catch(next)
})
// Update Team
router.patch('/teams/:id', requireToken, (req, res, next) => {
  delete req.body.team.owner
  Team.findById(req.params.id)
    .then(handle404)
    .then(team => {
      requireOwnership(req, team)
      return team.updateOne(req.body.team)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
// Destroy Team
router.delete('/teams/:id', requireToken, (req, res, next) => {
  Team.findById(req.params.id)
    .then(handle404)
    .then(team => {
      requireOwnership(req, team)
      team.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
module.exports = router