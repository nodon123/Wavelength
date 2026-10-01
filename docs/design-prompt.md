You're revising the Wavelength prototype (Wavelength.dc.html). Keep the existing visual language: dark UI, Archivo / DM Mono, the five color groups (Teal, Purple, Coral, Blue, Gold), the Student/Facilitator view toggle, and the four games (Frequency, Community Molecules, Two Truths Trade, Collective Biography). Don't start over. Extend what's there.

## Who it's for
The primary user is a facilitator responsible for the education and development of students in a collaborative environment. Most often that's a college instructor running a 50–75 minute class of 20–60 students, in a room where many students don't know each other. Students are the secondary user. They join on their own phones, may feel anxious, and should be in a group within 60 seconds of walking in.

## Design for a real class period
Every screen should hold up under these conditions:
- The instructor runs class from a laptop connected to a projector, and checks their phone while walking the room.
- Students arrive late or leave early. Some have no phone or a dead battery.
- Headcounts are uneven and change mid-activity.
- Wi-Fi in lecture halls is unreliable.
- The instructor is talking while running this, so every live control works in one tap and reads at a glance.
- The same class meets 2–3 times a week for a whole semester, so Wavelength is used repeatedly, not once.

## Must-have features (all 13 are required)

### Student
1. **Access code join, web and mobile.** Three ways in: type the code, scan the QR, or tap a link. Works in a mobile browser with no app install.
2. **Identification.** Name is required. LinkedIn and email are optional. The student chooses which of these their connections can see.
3. **Distinct student screen.** Fully separate from the facilitator experience.
4. **Sign-in and continued login.** The first join creates a lightweight account (email magic link or school/Google SSO). Returning students skip onboarding and go straight to today's class. A student who disconnects and rejoins lands back in the same group.
5. **Anonymity if desired.** Add a per-student setting to answer teacher questions anonymously. Answers used for group insights are always anonymized. Keep the existing privacy tiers and show the visibility label next to every input.

### Facilitator
6. **Distinct facilitator screen.** The primary layout is a laptop/projector view at 1280px. Add a compact phone version for walking the room.
7. **Facilitator-customizable access code.** The facilitator can set a custom code (e.g., BIO101) or use a generated one. Add a "Show join screen" presenter view that is readable from the back row: large code, QR, join link, and a live count of joined students.
8. **Group creation and automatic sorting.** Auto-assign color groups based on headcount. Slot late joiners into the smallest group, and offer to rebalance when group sizes drift.
9. **Easy regrouping.** One tap reshuffles. The facilitator can change group count or size mid-class, drag a student between groups, and lock groups. Show a preview before pushing new groups to phones.
10. **Customizable content.** Edit, add, or remove prompts for any game. Save a custom agenda as a reusable template.
11. **Icebreaker activities screen with an instructional walkthrough.** Keep the existing game guides (why this game, how to play, sample prompts). Add a short "say this" script the instructor can read aloud, and a projector version of the instructions for students.
12. **Progress/completion bar.** Show per-student and class-wide progress. Quietly flag students who haven't joined or who are stuck, without putting anyone on the spot.
13. **Timeline view for activities.** The agenda appears as a timeline with a planned duration per game, a running timer for the current activity, and time remaining in class. Warn the instructor when the agenda will run over. Offer quick-start templates: 10-minute warm-up, 20-minute session, and full class.

## Real-class improvements
- **No-phone fallback.** The projector view can show group assignments by name, so a student without a phone can still take part.
- **Poor connection.** Phones cache the current activity and prompt. Show a quiet "reconnecting" state, never a hard error.
- **Accessibility.** Each color group also gets a symbol and a name, so groups never rely on color alone (color-blind safe). Use large tap targets and support larger text sizes.
- **Late-join path.** A student who joins mid-activity sees "You're in Blue — here's what your group is doing now" instead of starting at the Welcome step.
- **Semester continuity.** On repeat sessions, auto-grouping avoids repeating last session's groups so students meet new people. The facilitator sees "new connections this week."
- **Privacy.** The roster export includes only the contact info each student chose to share. The export screen tells the instructor exactly what's included.
- **Fast wrap-up.** Students get a single end-of-class screen (who you met, add connections) that takes under 60 seconds.

## Fix in the current prototype
- On the student Now screen, the "Welcome" header collides with the status bar when the page scrolls.
- The "Do this now" card covers the teacher questions and the "Share with my teacher" button. Make it collapsible, or dock it so it never sits on top of inputs.
- "Summary" is both a bottom tab and a sub-tab inside Insights. Rename one of them (e.g., make the bottom tab "Wrap-up").

## Out of scope for this version
These are Wants. Don't build them, but leave room in the layout for them later: polls, AI prompt search, syllabus/slide upload to generate discussion topics, AI discussion bot, AI summary of student answers, informed (interest-based) group splitting, and student-to-facilitator messaging.

## Deliverable
Update the prototype so both flows are clickable end to end. Add these new screens:
- sign-in and returning-student
- presenter join screen
- regroup preview
- prompt/agenda editor
- timeline with timer
- laptop facilitator layout
- late-join state
- projector instructions

Finish with a short checklist that maps each of the 13 must-haves to the screen(s) that cover it.
