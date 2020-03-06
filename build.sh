cd ../Courseware_Framework
git reset --hard HEAD
git clean -dfx
git pull
echo "========>>Courseware_Framework更新成功<<========"

cd ../CoursewareModule

oldversion=$(grep "version" /Users/liuxiaomeng/Desktop/htsw_git/CoursewareModule/src/config/CoursewareDefines.ts |awk -F ' = ' '{print $2}'|awk -F ';' '{print $1}')
newversion=$(grep "version" /Users/liuxiaomeng/Desktop/htsw_git/CoursewareModule/src/config/CoursewareDefines.ts |awk -F ' = ' '{print $2}'|awk -F ';' '{print $1}'|awk '{print $0+1}')
sed 's/'$oldversion'/'$newversion'/g' /Users/liuxiaomeng/Desktop/htsw_git/CoursewareModule/src/config/CoursewareDefines.ts > /Users/liuxiaomeng/Desktop/htsw_git/CoursewareModule/src/config/CoursewareDefines.out
mv /Users/liuxiaomeng/Desktop/htsw_git/CoursewareModule/src/config/CoursewareDefines.out /Users/liuxiaomeng/Desktop/htsw_git/CoursewareModule/src/config/CoursewareDefines.ts

egret build ./

rm -rf ../Courseware_Framework/libs/CoursewareModule/CoursewareModule.min.js
rm -rf ../Courseware_Framework/libs/CoursewareModule/CoursewareModule.js
rm -rf ../Courseware_Framework/libs/CoursewareModule/CoursewareModule.d.ts
cp bin/CoursewareModule.min.js ../Courseware_Framework/libs/CoursewareModule
cp bin/CoursewareModule.js ../Courseware_Framework/libs/CoursewareModule
cp bin/CoursewareModule.d.ts ../Courseware_Framework/libs/CoursewareModule
echo "========>>工程内项目更新成功<<========"

cd ../Courseware_Framework
git add .
git commit -am "CoursewareModule上传更新包,版本号为："$newversion
git push
echo "========>>Courseware_Framework上传CoursewareModule更新<<========"

cd ../CoursewareModule
git add .
git commit -am "CoursewareModule提交,版本号为："$newversion
git push
echo "========>>提交CoursewareModule更新<<========"

