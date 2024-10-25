from git import Repo
import time
import datetime
now = time.time()
r = Repo(".")
for x in r.remotes:
    for url in x.urls:
        url = url.replace("git@github.com:","git+https://github.com/")
        for z in x.refs:
            if (z.is_valid()):
                cd = time.gmtime(z.commit.committed_date)
                diff = now -z.commit.committed_date
                diff2 = datetime.timedelta(seconds=diff)
                days = diff2.days
                if days < 30:
                    print("\t\""+str(url)+"#" +str(z.commit)+ "\", #" + time.asctime(cd) + " " + str(days) + " " + z.name)
