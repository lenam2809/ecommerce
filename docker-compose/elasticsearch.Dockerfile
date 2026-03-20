FROM docker.elastic.co/elasticsearch/elasticsearch:8.16.3

# Install icu plugin for Vietnamese search
RUN bin/elasticsearch-plugin install --batch analysis-icu
