UPLENDO
to deploy this app, run the 'deploy.sh' script located in the server folder.
to start the server without deploying run 'node server.js' in the server folder.


Known Bugs/Issues:
none

Time to display main page:
-DOM content loaded: 21 ms
-Fully loaded: 109 ms

SPRINT 5 runtime tests:
DOM content loaded down ~10 ms to 10 ms average
This is due to implementing a service worker to store content in cache

Browser compatibility:
Windows - Chrome: Works
Windows - Edge: Works
Linux - Firefox: Works

Apple Safari: Works

SPRINT 5 Browers Compatibility:
Previously, some browsers did not load http sites, so we migrated to https

SPRINT 5 OTHER
security: moved to https
requirements: implemented offline, teacher communication, and teacher feedback

3 Story Acceptance tests
User tries to log in > User signs up > user signs out > user logs in
Educator creates course > User joins course > User views course material
User submits quiz answer > Educator reviews quiz answer > Educator grades quiz answer > User receives grade

Testing coverage
backend: 60% through code coverage
backend: 90% with acceptance tests
frontend: 20% through code coverage
frontend: 80% with acceptance tests

I think our testing is sufficient because we minimized side effects, so even if we haven't tested a specific fucntion, as long as we do not change it, it will continue to work as expected.

We have disabled https errors, because we do not wish to go to a certificate authority.
