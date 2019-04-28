import axios from 'axios';
import { put, takeLatest } from 'redux-saga/effects';

const exampleWPPost = {
    "title": "test title",
    "status": "Test status",
    "featured_media": "blah media",
    "type": "API",
    "content": "Cat ipsum dolor sit amet, throwup on your pillow jump around on couch, meow constantly until given food, eat an easter feather as if it were a bird then burp victoriously, but tender yet really likes hummus. Good now the other hand, too fall asleep on the washing machine yet drink water out of the faucet but slap the dog because cats rule, meoooow sniff catnip and act crazy lick face hiss at owner, pee a lot, and meow repeatedly scratch at fence purrrrrr eat muffins and poutine until owner comes back. Meow meow and sometimes switches in french and say miaou just because well why not crusty butthole. Sniff catnip and act crazy scratch leg; meow for can opener to feed me put butt in owner's face yet eat prawns daintily with a claw then lick paws clean wash down prawns with a lap of carnation milk then retire to the warmest spot on the couch to claw at the fabric before taking a catnap. Pretend not to be evil hiss at vacuum cleaner be a nyan cat, feel great about it, be annoying 24/7 poop rainbows in litter box all day, mice cat cat moo moo lick ears lick paws. Cough lounge in doorway cat snacks, and love you, then bite you for hiding behind the couch until lured out by a feathery toy so reward the chosen human with a slow blink and sometimes switches in french and say miaou just because well why not. Eat a rug and furry furry hairs everywhere oh no human coming lie on counter don't get off counter miaow then turn around and show you my bum for lick butt and make a weird face for sleep everywhere, but not in my bed yet refuse to leave cardboard box yet need to chase tail. Jump around on couch, meow constantly until given food, . Cat slap dog in face meow so make it to the carpet before i vomit mmmmmm and push your water glass on the floor but claws in your leg no, you can't close the door, i haven't decided whether or not i wanna go out. Rub my belly hiss get scared by sudden appearance of cucumber for sleeps on my head. Sit on the laptop meeeeouw so steal the warm chair right after you get up roll over and sun my belly, so i want to go outside let me go outside nevermind inside is better eat grass, throw it back up. Jump up to edge of bath, fall in then scramble in a mad panic to get out purr as loud as possible, be the most annoying cat that you can, and, knock everything off the table. Meow meow mama i vomit in the bed in the middle of the night, sniff all the things cat sit like bread so stand with legs in litter box, but poop outside but crusty butthole, cough hairball on conveniently placed pants. That box? i can fit in that box relentlessly pursues moth and please stop looking at your phone and pet me relentlessly pursues moth or make plans to dominate world and then take a nap. Purr. Plan steps for world domination sit by the fire sun bathe stares at human while pushing stuff off a table eats owners hair then claws head chew iPad power cord. Instead of drinking water from the cat bowl, make sure to steal water from the toilet try to jump onto window and fall while scratching at wall reward the chosen human with a slow blink chew master's slippers and mice knock over christmas tree for lick the plastic bag."
};

// POST saga ie saga to post the podcast to podbean (will add later)

function* publishWordpress() {
    try {
        const tokenCheck = yield axios({
            method: 'POST',
            url: '/wordpress/post_episode',
            // EF Note: Data attribute needs to be a JSON object. Believe me, it'll make life easier.
            data: exampleWPPost,
        })
    } catch (error) {
        console.log('Token get wordpress failed logging error', error)
    }
}


//below function is for checking if we have a token from the site.
function* checktoken() {
    try {
        const tokenCheck = yield axios({
            method: 'GET',
            url: '/wordpress/token_check',
        })
        yield put({ type: 'SET_WORDPRESS_TOKEN', payload: tokenCheck.data }) // data should be a bowlean.
            // will send to podbean reducer and change the token value
    } catch (error) {
        console.log('Token get wordpress failed logging error', error)
    }
}

function* wordpressSaga() {
    yield takeLatest('CHECK_TOKEN', checktoken);
    yield takeLatest('PUBLISH_WORDPRESS', publishWordpress)
}

export default wordpressSaga;