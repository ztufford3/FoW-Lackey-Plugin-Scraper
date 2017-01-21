#include <fstream>
#include <string>
#include <algorithm>

#define E_NO_SET_FOUND	-1

using namespace std;

int find_card_number(string in);
int sort(string *arr, int length);
int order(string *in1, string *in2);

string *sets;
int num_sets = 18;

int main() {

	string data;
	string file = "/Users/zacharytufford/Downloads/LackeyCCG/plugins/ForceOfWill/sets/carddata.txt";
    ifstream in(file.c_str());
    getline(in, data, string::traits_type::to_char_type(
                      string::traits_type::eof()));
   	
   	string *entries = new string[10000];
   	sets = new string[num_sets];
   	sets[0] = "CMF-";
   	sets[1] = "TAT-";
   	sets[2] = "MPR-";
   	sets[3] = "MOA-";
   	sets[4] = "VIN001-";
   	sets[5] = "VS01-";
   	sets[6] = "SKL-";
   	sets[7] = "TTW-";
   	sets[8] = "TMS-";
   	sets[9] = "BFA-";
   	sets[10] = "VIN002-";
   	sets[11] = "SDL1-";
   	sets[12] = "SDL2-";
   	sets[13] = "SDL3-";
   	sets[14] = "SDL4-";
   	sets[15] = "SDL5-";
   	sets[16] = "CFC-";
   	sets[17] = "LEL-";

   	int index = 0;
   	int pos;
   	int end;
   	int check;
   	string card;

   	while((pos = find_card_number(data)) != -1) {

   		card = data.substr(pos);

   		end = card.find("\t");

   		entries[index] = card.substr(0, end);

   		if((check = entries[index].find(",-j")) != -1)
   			entries[index] = entries[index].substr(0, check);
   		else {
   			if((check = entries[index].find(",")) > 0) {
   				entries[index+1] = entries[index].substr(check+1, end);
   				entries[index] = entries[index].substr(0, check);
   				index++;
   			}
   		}
   		
   		index++;

   		data.erase(pos, end);
  
   	}

   	string out = " echo \"CardImageURLs:\n";
   	
   	if(sort(entries, index)) {
   		printf("Sorting failed.\n");
   		exit(-1);
   	}

   	for(int i = 0; i < index; i++) {
   		entries[i].erase(remove_if(entries[i].begin(), entries[i].end(), ::isspace), entries[i].end());
   		string set = entries[i].substr(0, entries[i].find("-"));
   		out += (set + '/' + entries[i] + ".jpg\t" + "https://dl.dropboxusercontent.com/u/14476048/Lackey/" + set + '/' + entries[i] + ".jpg\n");
   	}
   	out += "\" >> /Users/zacharytufford/Downloads/LackeyCCG/plugins/ForceOfWill/CardImageURLs.txt";
   	system(out.c_str());
}

int find_card_number(string in) {
	int n = -1;
	
	for(int k = 0; k < num_sets; k++)
		if((n = in.find(sets[k])) != -1)
			return n;

	return E_NO_SET_FOUND;
}

int sort(string *arr, int length) {
	int r;

	for(int i = 0; i < length; i++)
		for(int j = i+1; j < length; j++)
			if((r = order(&arr[i], &arr[j])))
				return r;

	return 0;
}

int order(string *in1, string *in2) {
	int set1 = -1;
	int set2 = -1;
	for(int i = 0; i < num_sets; i++) {
		if((*in1).substr(0, (*in1).find("-")+1).compare(sets[i]) == 0 && (set1 == -1))
			set1 = i;

		if((*in2).substr(0, (*in2).find("-")+1).compare(sets[i]) == 0 && (set2 == -1))
			set2 = i;

		if((set1 != -1) && (set2 != -1))
			break;
	}

	int num1 = stoi((*in1).substr((*in1).find("-")+1), nullptr, 10);
	int num2 = stoi((*in2).substr((*in2).find("-")+1), nullptr, 10);

	if((set1 == -1) || (set2 == -1) || (num1 == -1) || (num2 == -1)) {
		printf("ordering failed. set1: %d set2: %d num1: %d num2: %d\n", set1, set2, num1, num2);
		return -1;
	}

	if(set1 > set2 || ((set1 == set2) && (num1 > num2))) {

		string temp;
		temp = *in1;
		*in1 = *in2;
		*in2 = temp;
	
	}

	return 0;
}