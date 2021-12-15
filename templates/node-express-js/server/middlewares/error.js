module.exports = (req, res, next) => {
    res.sendError(null, "Route not found")
}