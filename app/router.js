module.exports = ({ controller }) => {
    return {
        'get /': controller.base.index
    }
}