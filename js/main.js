4var refMessages = new Firebase('https://pickup-game.firebaseio.com/messages');
var refUsers = new Firebase('https://pickup-game.firebaseio.com/users');
var refGroups = new Firebase('https://pickup-game.firebaseio.com/groups');



angular.module('pickupGame', [
    'firebase','ngRoute'])

.constant('fb', {
    url: 'https://pickup-game.firebaseio.com/'
})

.config(function($routeProvider,$locationProvider){
    $routeProvider

    .when('/',{
        templateUrl : 'pages/home.html',
        controller  : 'homeController'
    })
    .when('/groups',{
        templateUrl : 'pages/groups.html',
        controller  : 'groupsController'
    })
    .when('/profile',{
        templateUrl : 'pages/profile.html',
        controller  : 'profileController'
    })
})

.controller('appController', function($scope, fb, $firebaseAuth){

    var fbRef = new Firebase(fb.url);
    $scope.authObj = $firebaseAuth(fbRef);

    $scope.loginWith = function(provider){
        $scope.authObj.$authWithOAuthPopup(provider).then(function(authData){

            refUsers.once('value',function(snap){
               if(!(snap.hasChild(authData.uid))){
                   refUsers.child(authData.uid).set({displayName:authData[provider].displayName,displayImg:authData[provider].profileImageURL});
                   loginUser(authData.uid);
               } else {
                   loginUser(authData.uid);
               }
            });

        }).catch(function(error){
            $scope.loggedIn = false;
            console.log('auth failed: ', error);
        });
    }
    if(getCookie('uid') !== undefined){
      $scope.loggedIn = true;
    }
    if($scope.loggedIn == true){
      loginUser(getCookie('uid'));
    }


})

.controller("homeController", ["$scope", "$firebaseArray",
    function($scope, $firebaseArray) {
        var messagesRef = new Firebase('https://pickup-game.firebaseio.com/messages');

        $scope.messages = $firebaseArray(messagesRef);
    }
])


.controller('profileController', ["$scope",
    function($scope){

    }
])

.controller('groupsController', ["$scope",
    function($scope){

    }
])



///////////////////////
///////////////////////


function loginUser(uid){
    var appScope = angular.element($('body')).scope();

    refUsers.once('value',function(snap){
        if(!snap.hasChild(uid)){
            alert('Invalid Login!');
        } else {
            appScope.uid = uid,
            appScope.user = {};
            appScope.user.name = snap.child(uid+'/displayName').val(),
            appScope.user.img = snap.child(uid+'/displayImg').val(),
            appScope.loggedIn = true;
            writeCookie('uid',uid,3);
            if(!getCookie('loggedIn')){
                writeCookie('loggedIn',true,3);
                location.reload();
            }
            //$('#loginModal').fadeOut(250);
            appScope.$apply();
        }
    });
}

function logOutUser(){
    var appScope = angular.element($('body')).scope();
    deleteCookie(appScope.uid);
    deleteCookie('loggedIn');
    appScope.uid = '',
    appScope.displayname = '',
    appScope.displayimg = '',
    appScope.loggedIn = false;
    location.reload();
}

function addMessage() {
    var scope = angular.element($('body')).scope();
    var message = $('#messageInput').val(),uid = scope.user.uid, displayname = scope.user.name, displayimg = scope.user.img;
    var messageDate = new Date().toLocaleString(), timestamp = new Date().getTime();
    message = message.replace(/(<([^>]+)>)/ig,"");
    message = message.replace(/\n/g, "<br>");
    if(uid !== '' && message !== '') {
        var newMessageRef = refMessages.push({displayname:displayname,date:messageDate,message:message,img:displayimg});
        newMessageRef.update({rid: newMessageRef.key()});
        $('#messageInput').val('');
        $('#main-content').scrollTop($('#main-content')[0].scrollHeight);


    }else {
        alert('Something happened, idk what though..');
    }


}
