#!/usr/bin/env bash
# Every video on the site, from the Remotion projects in this repo.
set -e
R=..
E="bash scripts/encode.sh"
# websites (case-study films)
$E $R/appify-portfolio/public/media/wtc-launch.mp4 wtc-launch 6 960
$E $R/appify-pov/out/Appify-POV-Websites-2026-Feed-NoMusic.mp4 firnlight 4 720
$E $R/appify-oddball/out/Appify-Oddball-POV-2026-Feed.mp4 oddball 5 720
$E $R/appify-classiccars/out/Appify-Valmora-POV-2026-Feed.mp4 valmora 6 720
$E $R/appify-game/out/Appify-Earshot-NotAGame-Feed.mp4 earshot 4 720
# motion graphics & content ads
$E $R/appify-balloon/out/Appify-Balloon3D-Reel.mp4 balloon 5.6 720
$E $R/appify-showreel/out/Appify-Showreel-Reel.mp4 showreel 3 720
$E $R/appify-ecom/out/Appify-Ecom-Reel.mp4 ecommerce-chat 2 720
$E $R/appify-lifetime/out/Appify-Lifetime-Reel.mp4 lifetime 3 720
$E $R/appify-ads/out/Appify-MetaAds-Reel.mp4 meta-ads 2 720
$E $R/appify-portfolio/public/media/motion-reel.mp4 photos-get-scrolled 3 720
$E $R/appify-portfolio/public/media/subscription-killer.mp4 subscription-killer 3 720
$E $R/appify-portfolio/public/media/ideas-appified.mp4 ideas-appified 4 720
$E $R/appify-portfolio/public/media/logo-reveal.mp4 logo-reveal 7 720
$E $R/appify-portfolio/public/media/comparison.mp4 comparison 10 720
