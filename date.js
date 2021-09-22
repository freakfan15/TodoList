//inlcudeing the getDay fn in module.exports
exports.getDate = function (){
    const today = new Date();
    // var currentDay = today.getDay();

    const options = {
       weekday: 'long',
       day: 'numeric',
       month: 'long'
    }

    const day = today.toLocaleDateString("en-US", options);
    return day;
}

exports.getDay = function(){
    const today = new Date();
    // var currentDay = today.getDay();

    const options = {
       weekday: 'long',
    }

    const day = today.toLocaleDateString("en-US", options);
    return day;
}
   
   