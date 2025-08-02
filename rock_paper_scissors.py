import random
import cv2
import cvzone
from cvzone.HandTrackingModule import HandDetector
import time

cap = cv2.VideoCapture(1)
cap.set(3, 640)
cap.set(4, 480)

detector = HandDetector(maxHands=1)

timer = 0
stateResult = False
startGame = False
gameOver = False
scores = [0, 0]  # [AI, Player]
imgAI = None  # Initialize imgAI

while True:
    imgBG = cv2.imread("Resources/BG.png")
    success, img = cap.read()

    imgScaled = cv2.resize(img, (0, 0), None, 0.875, 0.875)
    imgScaled = imgScaled[:, 80:480]

    # Find Hands
    hands, img = detector.findHands(imgScaled)

    if startGame:
        if stateResult is False:
            timer = time.time() - initialTime
            cv2.putText(imgBG, str(int(timer)), (605, 435), cv2.FONT_HERSHEY_PLAIN, 6, (255, 0, 255), 4)

            if timer > 3:
                stateResult = True
                timer = 0

                # Generate AI move (always happens)
                randomNumber = random.randint(1, 3)
                imgAI = cv2.imread(f'Resources/{randomNumber}.png', cv2.IMREAD_UNCHANGED)

                playerMove = None  # Default value

                if hands:
                    hand = hands[0]
                    fingers = detector.fingersUp(hand)
                    if fingers == [0, 0, 0, 0, 0]:
                        playerMove = 1  # Rock
                    elif fingers == [1, 1, 1, 1, 1]:
                        playerMove = 2  # Paper
                    elif fingers == [0, 1, 1, 0, 0]:
                        playerMove = 3  # Scissors

                # Only calculate scores if player made a valid move
                if playerMove is not None:
                    # Player Wins
                    if (playerMove == 1 and randomNumber == 3) or \
                            (playerMove == 2 and randomNumber == 1) or \
                            (playerMove == 3 and randomNumber == 2):
                        scores[1] += 1
                        print(f"Player wins! Player: {playerMove}, AI: {randomNumber}")
                    # AI Wins
                    elif (playerMove == 3 and randomNumber == 1) or \
                            (playerMove == 1 and randomNumber == 2) or \
                            (playerMove == 2 and randomNumber == 3):
                        scores[0] += 1
                        print(f"AI wins! Player: {playerMove}, AI: {randomNumber}")
                    # Tie
                    else:
                        print(f"It's a tie! Player: {playerMove}, AI: {randomNumber}")
                else:
                    print(f"No valid player move detected. AI played: {randomNumber}")

                # Check for game over (first to 3 points)
                if scores[0] >= 3:
                    gameOver = True
                    print("🤖 AI WINS THE MATCH! 🤖")
                    print(f"Final Score - AI: {scores[0]}, Player: {scores[1]}")
                elif scores[1] >= 3:
                    gameOver = True
                    print("🎉 PLAYER WINS THE MATCH! 🎉")
                    print(f"Final Score - AI: {scores[0]}, Player: {scores[1]}")

    imgBG[234:654, 795:1195] = imgScaled

    # Display AI move if game result is shown
    if stateResult and imgAI is not None:
        imgBG = cvzone.overlayPNG(imgBG, imgAI, (149, 310))

    # Display scores
    cv2.putText(imgBG, str(scores[0]), (410, 215), cv2.FONT_HERSHEY_PLAIN, 4, (255, 255, 255), 6)
    cv2.putText(imgBG, str(scores[1]), (1112, 215), cv2.FONT_HERSHEY_PLAIN, 4, (255, 255, 255), 6)

    # Display game over message
    if gameOver:
        # Create semi-transparent overlay
        overlay = imgBG.copy()
        cv2.rectangle(overlay, (200, 300), (1000, 500), (0, 0, 0), -1)
        imgBG = cv2.addWeighted(imgBG, 0.7, overlay, 0.3, 0)

        if scores[0] >= 3:
            cv2.putText(imgBG, "AI WINS!", (350, 380), cv2.FONT_HERSHEY_PLAIN, 6, (0, 0, 255), 8)
        else:
            cv2.putText(imgBG, "PLAYER WINS!", (280, 380), cv2.FONT_HERSHEY_PLAIN, 6, (0, 255, 0), 8)

        cv2.putText(imgBG, "Press 'r' to restart", (350, 450), cv2.FONT_HERSHEY_PLAIN, 3, (255, 255, 255), 4)

    cv2.imshow("BG", imgBG)

    key = cv2.waitKey(1)
    if key == ord('s') and not gameOver:  # Only start new round if game not over
        startGame = True
        initialTime = time.time()
        stateResult = False
        imgAI = None  # Reset AI image
    elif key == ord('r'):  # Restart the entire match
        startGame = False
        stateResult = False
        gameOver = False
        scores = [0, 0]
        imgAI = None
        print("Match restarted! Press 's' to begin.")
    elif key == ord('q'):  # Added quit option
        break

cap.release()
cv2.destroyAllWindows()