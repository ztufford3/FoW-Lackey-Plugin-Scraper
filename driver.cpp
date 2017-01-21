#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char **argv) {

	if(argc < 2) {
		printf("Either enter one or more sets or specify \"all\"!\n");
		exit(-1);
	}

	//need to see how they fucked up vin001
	char *sets[19] = {"CMF", "TAT", "MPR", "MOA", "VIN001", "VS01", "SKL", "TTW", "TMS", "BFA", "VIN002", "SDL1", "SDL2", "SDL3", "SDL4", "SDL5", "CFC", "LEL", "\"Magic Stones\""};

	char command[sizeof("echo \"Name\tSet\tImageFile\tType\tSubtype/Race\tCost\tT.Cost\tATK\tDEF\tAttribute\tRarity\tCardtext\n\" >> ~/Downloads/LackeyCCG/plugins/ForceOfWill/sets/carddata.txt")];

	if(strcmp(argv[1], "all") == 0) {
		argv = sets;
		argc = 19;
		sprintf(command, "rm ~/Downloads/LackeyCCG/plugins/ForceOfWill/sets/carddata.txt");
		system(command);
		sprintf(command, "rm ~/Downloads/LackeyCCG/plugins/ForceOfWill/CardImageURLs.txt");
		system(command);
		sprintf(command, "cd ~/Downloads/LackeyCCG/plugins/ForceOfWill/sets/;rm -rf setimages;mkdir setimages");
		system(command);
		sprintf(command, "echo \"Name\tSet\tImageFile\tType\tSubtype/Race\tCost\tT.Cost\tATK\tDEF\tAttribute\tRarity\tCardtext\n\" >> ~/Downloads/LackeyCCG/plugins/ForceOfWill/sets/carddata.txt");
		system(command);
	}

	for(int i = 0; i < argc; ++i) {
		if(strcmp(argv[i], "./driver") == 0)
			continue;
		sprintf(command, "phantomjs searchcard.js %s >> ~/Downloads/LackeyCCG/plugins/ForceOfWill/sets/carddata.txt", argv[i]);
		//sprintf(command, "phantomjs searchcard.js %s >> test_out.txt", argv[i]);
		printf("Mining set %s.\n", argv[i]);
		system(command);
	}

	sprintf(command, "./updimgurls");
	printf("Updating Card Image URLs\n");
	system(command);
}