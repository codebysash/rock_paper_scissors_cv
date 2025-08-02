import cv2
import cvzone
from cvzone.HandTrackingModule import HandDetector

cap = cv2.VideoCapture(1)
cap.set(3, 640)
cap.set(4, 480)

detector = HandDetector(maxHands=1)

while True:
    imgBG = cv2.imread("Resources/BG.png")
    success, img = cap.read()

    imgScaled = cv2.resize(img,(0,0), None, 0.875, 0.875)
    imgScaled = imgScaled[:,80:480]

    # Find Hands
    hands, img = detector.findHands(imgScaled)

    imgBG[234:654, 795:1195] = imgScaled



    cv2.imshow("Image", img)
    cv2.imshow("BG", imgBG)
    cv2.imshow("Scaled", imgScaled)

    cv2.waitKey(1)